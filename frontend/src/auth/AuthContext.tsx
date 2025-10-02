import { createContext } from "react";
import type { ReactNode } from "react";

interface User {
  id: number;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  initializing?: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { User, ReactNode };
