import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SettingsContextType {
  language: string;
  weightUnit: 'lbs' | 'kg';
  darkMode: boolean;
  notifications: boolean;
  autoRest: boolean;
  restInterval: number;
  setLanguage: (language: string) => void;
  setWeightUnit: (unit: 'lbs' | 'kg') => void;
  setDarkMode: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setAutoRest: (enabled: boolean) => void;
  setRestInterval: (seconds: number) => void;
  convertWeight: (weight: number, fromUnit?: string, toUnit?: string) => number;
  formatWeight: (weight: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState(() => 
    localStorage.getItem('fitness-app-language') || 'en'
  );
  const [weightUnit, setWeightUnitState] = useState<'lbs' | 'kg'>(() => 
    (localStorage.getItem('fitness-app-weight-unit') || 'lbs') as 'lbs' | 'kg'
  );
  const [darkMode, setDarkModeState] = useState(() => 
    localStorage.getItem('fitness-app-theme') === 'dark'
  );
  const [notifications, setNotificationsState] = useState(() => 
    localStorage.getItem('fitness-app-notifications') !== 'false'
  );
  const [autoRest, setAutoRestState] = useState(() =>
    localStorage.getItem('fitness-app-auto-rest') !== 'false'
  );
  const [restInterval, setRestIntervalState] = useState(() =>
    parseInt(localStorage.getItem('fitness-app-rest-interval') || '90', 10)
  );

  // Apply dark mode on initial load
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('fitness-app-language', newLanguage);
  };

  const setWeightUnit = (newUnit: 'lbs' | 'kg') => {
    setWeightUnitState(newUnit);
    localStorage.setItem('fitness-app-weight-unit', newUnit);
  };

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
    localStorage.setItem('fitness-app-theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  };

  const setNotifications = (enabled: boolean) => {
    setNotificationsState(enabled);
    localStorage.setItem('fitness-app-notifications', enabled.toString());
  };

  const setAutoRest = (enabled: boolean) => {
    setAutoRestState(enabled);
    localStorage.setItem('fitness-app-auto-rest', enabled.toString());
  };

  const setRestInterval = (seconds: number) => {
    setRestIntervalState(seconds);
    localStorage.setItem('fitness-app-rest-interval', seconds.toString());
  };

  const convertWeight = (weight: number, fromUnit?: string, toUnit?: string): number => {
    const from = fromUnit || weightUnit;
    const to = toUnit || weightUnit;
    
    if (from === to) return weight;
    if (from === 'lbs' && to === 'kg') return Math.round(weight * 0.453592 * 10) / 10;
    if (from === 'kg' && to === 'lbs') return Math.round(weight * 2.20462 * 10) / 10;
    return weight;
  };

  const formatWeight = (weight: number): string => {
    return `${weight} ${weightUnit}`;
  };

  const value: SettingsContextType = {
    language,
    weightUnit,
    darkMode,
    notifications,
    autoRest,
    restInterval,
    setLanguage,
    setWeightUnit,
    setDarkMode,
    setNotifications,
    setAutoRest,
    setRestInterval,
    convertWeight,
    formatWeight,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};