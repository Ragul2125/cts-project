import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';

export interface UserRecord {
  type: 'patient' | 'hospital' | 'cms';
  fullName?: string;
  orgName?: string;
  memberId?: string;
  regId?: string;
  adminId?: string;
  mobile?: string;
  email?: string;
  dob?: string;
  address?: string;
  passwordHash?: string;
}

export interface SessionRecord {
  type: 'patient' | 'hospital' | 'cms';
  name: string;
  memberId?: string;
  regId?: string;
  adminId?: string;
  email?: string;
  loginTime: string;
}

const USERS_KEY = 'carenexus_users';
const SESSION_KEY = 'carenexus_session';

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h.toString(36);
}

const loadUsers = (): UserRecord[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      // Initialize with default demo patient Alex Johnson
      const defaultUsers: UserRecord[] = [
        {
          type: 'patient',
          fullName: 'Alex Johnson',
          memberId: 'PT-2024-8821',
          mobile: '+1 (555) 234-5678',
          email: 'alex.johnson@carepath.io',
          dob: '1988-04-12',
          passwordHash: simpleHash('password123'),
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const loadSession = (): SessionRecord | null => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveUsers = (u: UserRecord[]) => localStorage.setItem(USERS_KEY, JSON.stringify(u));
const saveSession = (s: SessionRecord) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

export function useAuth() {
  const [session, setSession] = useState<SessionRecord | null>(() => loadSession());

  useEffect(() => {
    // Keep users initialized
    loadUsers();
  }, []);

  /* ---- registerPatient ---- */
  const registerPatient = useCallback(async ({ fullName, memberId, mobile, email, dob, password }: {
    fullName: string;
    memberId: string;
    mobile: string;
    email: string;
    dob: string;
    password: string;
  }) => {
    try {
      // 1. Register with FastAPI backend
      const regEmail = email.trim().toLowerCase();
      await apiService.register({ email: regEmail, password, role: 'PATIENT' }).catch(() => null);

      // 2. Local user store fallback
      const users = loadUsers();
      const cleanMid = memberId.trim();

      const newUser: UserRecord = {
        type: 'patient',
        fullName: fullName.trim(),
        memberId: cleanMid,
        mobile: mobile.trim(),
        email: regEmail,
        dob,
        passwordHash: simpleHash(password),
      };

      saveUsers([...users.filter(u => u.email !== regEmail), newUser]);

      // 3. Attempt backend login to store JWT token
      await apiService.login({ email: regEmail, password }).catch(() => null);

      return { ok: true, user: newUser };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Registration failed' };
    }
  }, []);

  /* ---- registerHospital ---- */
  const registerHospital = useCallback(async ({ orgName, regId, email, mobile, address, password }: {
    orgName: string;
    regId: string;
    email: string;
    mobile: string;
    address: string;
    password: string;
  }) => {
    try {
      const regEmail = email.trim().toLowerCase();
      await apiService.register({ email: regEmail, password, role: 'HOSPITAL' }).catch(() => null);

      const users = loadUsers();
      const cleanReg = regId.trim();

      const newHosp: UserRecord = {
        type: 'hospital',
        orgName: orgName.trim(),
        regId: cleanReg,
        email: regEmail,
        mobile: mobile.trim(),
        address: address.trim(),
        passwordHash: simpleHash(password),
      };

      saveUsers([...users, newHosp]);
      return { ok: true, hospital: newHosp };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Hospital registration failed' };
    }
  }, []);

  /* ---- login (role-aware + FastAPI backend integration) ---- */
  const login = useCallback(async ({ role, identifier, password }: { role?: string; identifier: string; password: string }, rememberMe?: boolean) => {
    const id = identifier.trim();
    let loginEmail = id;

    // Map identifier to email based on role
    if (role === 'cms' || id.toLowerCase().includes('cms') || id.toLowerCase().includes('admin')) {
      loginEmail = 'cms@example.com';
    } else if (role === 'hospital' || id.toLowerCase().includes('hosp') || id.toLowerCase().includes('city general')) {
      loginEmail = 'hospital@example.com';
    } else {
      // Patient role
      loginEmail = id.includes('@') ? id : `patient${id}@example.com`;
      // Default to 204 if just generic
      if (id === 'patient' || id === '') {
        loginEmail = 'patient204@example.com';
      }
    }

    try {
      // 1. Actually await and require the FastAPI login
      await apiService.login({ email: loginEmail, password });
      
      // 2. If it succeeds, construct session
      let sess: SessionRecord;
      let finalRole = 'patient';

      if (loginEmail === 'cms@example.com') {
        finalRole = 'cms';
        sess = {
          type: 'cms',
          name: 'CMS Admin',
          adminId: 'CMS-ADMIN',
          email: loginEmail,
          loginTime: new Date().toISOString()
        };
      } else if (loginEmail === 'hospital@example.com') {
        finalRole = 'hospital';
        sess = {
          type: 'hospital',
          name: 'City General Hospital',
          regId: 'HOSP-2024-88',
          email: loginEmail,
          loginTime: new Date().toISOString()
        };
      } else {
        finalRole = 'patient';
        const memberId = id.includes('@') ? '204' : id;
        sess = {
          type: 'patient',
          name: `Patient ${memberId}`,
          memberId: memberId,
          email: loginEmail,
          loginTime: new Date().toISOString()
        };
      }

      if (rememberMe) saveSession(sess);
      setSession(sess);
      return { ok: true, session: sess, role: finalRole };

    } catch (err: any) {
      console.error('Backend API login failed:', err);
      // STRICT: Return false so frontend shows error
      return { ok: false, error: 'Authentication failed. Please check your credentials.' };
    }
  }, []);

  /* ---- logout ---- */
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return { session, login, logout, registerPatient, registerHospital };
}
