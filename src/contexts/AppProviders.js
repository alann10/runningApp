import React from 'react';
import { FirebaseProvider } from './FirebaseContext';
import { AuthProvider } from './AuthContext';

export const AppProviders = ({ children }) => {
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}; 