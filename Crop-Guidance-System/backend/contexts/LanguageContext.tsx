import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export function useLanguage() {
  return useContext(LanguageContext);
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { currentUser, farmerProfile, updateFarmerProfile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]); // Default to English
  const [isLoading, setIsLoading] = useState(true);

  // Load language from user profile or localStorage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        
        let languageToSet = languages[0]; // Default to English

        if (farmerProfile?.preferences?.language) {
          // Try to find language by name from user profile
          const profileLanguage = languages.find(
            lang => lang.name === farmerProfile.preferences.language
          );
          if (profileLanguage) {
            languageToSet = profileLanguage;
          }
        } else if (currentUser) {
          // If user is logged in but no profile language, check localStorage
          const savedLanguage = localStorage.getItem('cropwise-language');
          if (savedLanguage) {
            const parsedLanguage = JSON.parse(savedLanguage);
            const foundLanguage = languages.find(lang => lang.code === parsedLanguage.code);
            if (foundLanguage) {
              languageToSet = foundLanguage;
            }
          }
        } else {
          // For non-logged in users, check localStorage
          const savedLanguage = localStorage.getItem('cropwise-language');
          if (savedLanguage) {
            const parsedLanguage = JSON.parse(savedLanguage);
            const foundLanguage = languages.find(lang => lang.code === parsedLanguage.code);
            if (foundLanguage) {
              languageToSet = foundLanguage;
            }
          }
        }

        setCurrentLanguage(languageToSet);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading language:', error);
        setCurrentLanguage(languages[0]);
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [farmerProfile, currentUser]);

  const setLanguage = async (language: Language) => {
    try {
      setCurrentLanguage(language);
      
      // Save to localStorage for persistence
      localStorage.setItem('cropwise-language', JSON.stringify(language));
      
      // Update user profile if user is logged in
      if (currentUser && farmerProfile) {
        await updateFarmerProfile({
          preferences: {
            ...farmerProfile.preferences,
            language: language.name
          }
        });
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const value = {
    currentLanguage,
    setLanguage,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}
