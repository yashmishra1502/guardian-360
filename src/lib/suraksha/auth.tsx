import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthUser = {
  name: string;
  email: string;
  role: "authority";
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "suraksha360_auth_user";
const USERS_KEY = "suraksha360_auth_users";

type StoredUser = { name: string; email: string; password: string };

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function SurakshaAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const login: AuthContextValue["login"] = (email, password) => {
    const users = readUsers();
    const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) return { ok: false, error: "No account found for that email." };
    if (match.password !== password) return { ok: false, error: "Incorrect password." };
    const authUser: AuthUser = { name: match.name, email: match.email, role: "authority" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
  };

  const register: AuthContextValue["register"] = (name, email, password) => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      return { ok: false, error: "Fill all fields; password must be 6+ characters." };
    }
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser: StoredUser = { name: name.trim(), email: email.trim(), password };
    writeUsers([...users, newUser]);
    const authUser: AuthUser = { name: newUser.name, email: newUser.email, role: "authority" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useSurakshaAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useSurakshaAuth must be used within SurakshaAuthProvider");
  return ctx;
}
