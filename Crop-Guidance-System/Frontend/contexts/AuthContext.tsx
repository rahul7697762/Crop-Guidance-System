import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ApplicationVerifier,
  sendPasswordResetEmail as sendPasswordResetEmailAuth,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase/config';

export interface FarmerProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  farmLocation: {
    address: string;
    coordinates?: {
      latitude: number | null;
      longitude: number | null;
    } | null;
    state: string;
    district: string;
    pincode: string;
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
  signup: (email: string, password: string, additionalData: Partial<FarmerProfile>) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<{ verificationId: string }>;
  verifyOtp: (verificationId: string, otp: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateFarmerProfile: (data: Partial<FarmerProfile>) => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
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
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters long');
      }

      if (!additionalData.displayName) {
        throw new Error('Display name is required');
      }

      // Create user with email and password
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: additionalData.displayName
      });

      // Create farmer profile document with all required fields
      const farmerData: FarmerProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: additionalData.displayName,
        phoneNumber: additionalData.phoneNumber || '',
        farmLocation: {
          address: additionalData.farmLocation?.address || '',
          coordinates: additionalData.farmLocation?.coordinates || null,
          state: additionalData.farmLocation?.state || '',
          district: additionalData.farmLocation?.district || '',
          pincode: additionalData.farmLocation?.pincode || ''
        },
        farmDetails: {
          totalArea: additionalData.farmDetails?.totalArea || 0,
          soilType: additionalData.farmDetails?.soilType || '',
          irrigationType: additionalData.farmDetails?.irrigationType || [],
          currentCrops: additionalData.farmDetails?.currentCrops || []
        },
        preferences: {
          language: additionalData.preferences?.language || 'English',
          units: additionalData.preferences?.units || 'metric',
          notifications: additionalData.preferences?.notifications !== false // Default to true if not specified
        },
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Save to Firestore
      await setDoc(doc(db, 'farmers', user.uid), farmerData);
      
      // Update local state
      setFarmerProfile(farmerData);
      
      // If phone number is provided, update it (this will trigger verification)
      if (additionalData.phoneNumber) {
        try {
          await updatePhoneNumber(additionalData.phoneNumber);
        } catch (phoneError) {
          console.error('Error updating phone number:', phoneError);
          // Don't fail the signup if phone number update fails
        }
      }
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase Auth errors
      if ((error as any).code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if ((error as any).code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if ((error as any).code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error instanceof Error) {
        // Re-throw any other errors with their original message
        throw error;
      } else {
        throw new Error('An error occurred during signup. Please try again.');
      }
    }
  }

  // Login with email and password
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    // Update last login time
    if (auth.currentUser) {
      await updateDoc(doc(db, 'farmers', auth.currentUser.uid), {
        lastLogin: new Date()
      });
    }
  }

  // Login with phone number (sends OTP)
  async function loginWithPhone(phoneNumber: string) {
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+91${phoneNumber}`; // Default to India
    }

    // Initialize reCAPTCHA verifier if not already done
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }

    const appVerifier = (window as any).recaptchaVerifier as ApplicationVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    
    // Store the confirmation result for later use
    (window as any).confirmationResult = confirmationResult;
    
    // Return a verification ID that can be used to verify the OTP
    return { verificationId: 'phone-auth-verification-id' };
  }

  // Verify OTP for phone authentication
  async function verifyOtp(verificationId: string, otp: string) {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    await signInWithCredential(auth, credential);
    
    // Update last login time
    if (auth.currentUser) {
      await updateDoc(doc(db, 'farmers', auth.currentUser.uid), {
        lastLogin: new Date()
      });
    }
  }

  // Send password reset email
  async function sendPasswordResetEmail(email: string) {
    await sendPasswordResetEmailAuth(auth, email);
  }

  // Update user's phone number
  async function updatePhoneNumber(phoneNumber: string) {
    const user = auth.currentUser as FirebaseUser;
    if (!user) {
      throw new Error('No user is currently logged in');
    }

    // In a real app, you would need to verify the phone number first
    // This is a simplified version that just updates the Firestore document
    // For a complete implementation, you would need to:
    // 1. Send a verification code to the phone number
    // 2. Ask the user to enter the code
    // 3. Verify the code and update the phone number
    
    // Update in Firestore
    await updateDoc(doc(db, 'farmers', user.uid), {
      phoneNumber: phoneNumber
    });

    // If you need to update the phone number in Firebase Auth as well,
    // you would need to implement phone number verification first
    // await updatePhoneNumberAuth(user, phoneNumber);
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
    loginWithPhone,
    verifyOtp,
    sendPasswordResetEmail,
    logout,
    updateFarmerProfile,
    updatePhoneNumber,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}