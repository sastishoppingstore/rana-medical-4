import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';

export type Role = 'super_admin' | 'doctor' | 'receptionist' | 'lab_technician' | 'pharmacist' | 'accountant';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  accountant: 'Accountant',
};

interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  activeRole: Role;
  setActiveRole: (r: Role) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({
  user: null, session: null, loading: true, activeRole: 'super_admin',
  setActiveRole: () => {}, signIn: async () => {}, signUp: async () => {}, signOut: async () => {},
});

let _token = '';
export const getToken = () => _token;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<Role>('super_admin');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      _token = data.session?.access_token ?? '';
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      _token = s?.access_token ?? '';
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };
  const signOut = async () => { await supabase.auth.signOut(); setActiveRole('super_admin'); };

  return (
    <AuthCtx.Provider value={{ user, session, loading, activeRole, setActiveRole, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
