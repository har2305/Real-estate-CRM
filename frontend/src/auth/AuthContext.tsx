import { createContext } from "react";
import type { ReactNode } from "react";

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing?: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, first_name?: string, last_name?: string) => Promise<void>;
  logout: () => void;
  updateUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { User, ReactNode };
