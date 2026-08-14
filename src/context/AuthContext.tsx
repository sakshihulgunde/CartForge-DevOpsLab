import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const DEMO_USER: User = {
  name: 'Alex Morgan',
  email: 'admin@devops-platform.io',
  role: 'Platform Administrator',
  avatar: 'AM',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    if (email.trim().length > 0 && _password.trim().length > 0) {
      setUser(DEMO_USER);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
