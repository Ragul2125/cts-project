import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, SessionRecord, UserRecord } from '../hooks/useAuth';

interface AuthContextType {
  session: SessionRecord | null;
  login: (credentials: { role?: string; identifier: string; password: string }, rememberMe?: boolean) => Promise<{ ok: boolean; session?: SessionRecord; error?: string; role?: string }>;
  logout: () => void;
  registerPatient: (data: {
    fullName: string;
    memberId: string;
    mobile: string;
    email: string;
    dob: string;
    password: string;
  }) => Promise<{ ok: boolean; user?: UserRecord; error?: string }>;
  registerHospital: (data: {
    orgName: string;
    regId: string;
    email: string;
    mobile: string;
    address: string;
    password: string;
  }) => Promise<{ ok: boolean; hospital?: UserRecord; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
