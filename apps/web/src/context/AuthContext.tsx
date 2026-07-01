import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError } from "../api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("forge_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem("forge_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function signup(name: string, email: string, password: string) {
    const res = await api.signup(name, email, password);
    localStorage.setItem("forge_token", res.token);
    setUser(res.user);
  }

  async function login(email: string, password: string) {
    const res = await api.login(email, password);
    localStorage.setItem("forge_token", res.token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem("forge_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
