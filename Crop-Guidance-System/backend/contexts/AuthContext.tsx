import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface FarmerProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  farmLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    state: string;
    district: string;
  };
  farmDetails: {
    totalArea: number;
    soilType: string;
    irrigationType: string[];
    currentCrops: string[];
  };
  preferences: {
    language: string;
    units: 'metric' | 'imperial';
    notifications: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  currentUser: User | null;
  farmerProfile: FarmerProfile | null;
  loading: boolean;
  signup: (email: string, password: string, additionalData: Partial<FarmerProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateFarmerProfile: (data: Partial<FarmerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email: string, password: string, additionalData: Partial<FarmerProfile>) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile
    if (additionalData.displayName) {
      await updateProfile(user, {
        displayName: additionalData.displayName
      });
    }

    // Create farmer profile document
    const farmerData: FarmerProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: additionalData.displayName || '',
      phoneNumber: additionalData.phoneNumber || '',
      farmLocation: additionalData.farmLocation || {
        address: '',
        state: '',
        district: ''
      },
      farmDetails: additionalData.farmDetails || {
        totalArea: 0,
        soilType: '',
        irrigationType: [],
        currentCrops: []
      },
      preferences: additionalData.preferences || {
        language: 'English',
        units: 'metric',
        notifications: true
      },
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(doc(db, 'farmers', user.uid), farmerData);
    setFarmerProfile(farmerData);
  }

  // Sign in with email and password
  async function login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    if (user) {
      await updateFarmerProfile({ lastLogin: new Date() });
    }
  }

  // Sign in with Google
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Check if farmer profile exists
    const farmerDoc = await getDoc(doc(db, 'farmers', user.uid));
    
    if (!farmerDoc.exists()) {
      // Create new farmer profile for Google user
      const farmerData: FarmerProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        farmLocation: {
          address: '',
          state: '',
          district: ''
        },
        farmDetails: {
          totalArea: 0,
          soilType: '',
          irrigationType: [],
          currentCrops: []
        },
        preferences: {
          language: 'English',
          units: 'metric',
          notifications: true
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(doc(db, 'farmers', user.uid), farmerData);
      setFarmerProfile(farmerData);
    } else {
      // Update existing profile's last login
      await updateFarmerProfile({ lastLogin: new Date() });
    }
  }

  // Sign out
  async function logout() {
    setFarmerProfile(null);
    return signOut(auth);
  }

  // Update farmer profile
  async function updateFarmerProfile(data: Partial<FarmerProfile>) {
    if (!currentUser) return;
    
    const updatedData = { ...data };
    await setDoc(doc(db, 'farmers', currentUser.uid), updatedData, { merge: true });
    
    // Update local state
    setFarmerProfile(prev => prev ? { ...prev, ...updatedData } : null);
  }

  // Load farmer profile
  async function loadFarmerProfile(user: User) {
    try {
      const farmerDoc = await getDoc(doc(db, 'farmers', user.uid));
      if (farmerDoc.exists()) {
        const rawData = farmerDoc.data();
        // Convert Firestore Timestamps to Date objects
        const data: FarmerProfile = {
          ...rawData,
          createdAt: rawData.createdAt?.toDate ? rawData.createdAt.toDate() : new Date(rawData.createdAt),
          lastLogin: rawData.lastLogin?.toDate ? rawData.lastLogin.toDate() : new Date(rawData.lastLogin)
        } as FarmerProfile;
        setFarmerProfile(data);
      } else {
      }
    } catch (error) {
      console.error('Error loading farmer profile:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        userUid: user.uid,
        isAuthenticated: !!user
      });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadFarmerProfile(user);
      } else {
        setFarmerProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    farmerProfile,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,
    updateFarmerProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}