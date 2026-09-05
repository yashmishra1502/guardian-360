import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthUser = {
  name: string;
  email: string;
  department: string;
  designation: string;
  govtId: string;
  role: "authority";
};

type RegisterInput = {
  name: string;
  email: string;
  department: string;
  designation: string;
  govtId: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "suraksha360_auth_user";
const USERS_KEY = "suraksha360_auth_users";

type StoredUser = {
  name: string;
  email: string;
  department: string;
  designation: string;
  govtId: string;
  password: string;
};

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const login: AuthContextValue["login"] = async (email, password) => {
    await delay(900);
    const users = readUsers();
    const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) return { ok: false, error: "No account found for that email." };
    if (match.password !== password) return { ok: false, error: "Incorrect password." };
    const authUser: AuthUser = {
      name: match.name,
      email: match.email,
      department: match.department,
      designation: match.designation,
      govtId: match.govtId,
      role: "authority",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { ok: true };
  };

  const register: AuthContextValue["register"] = async (input) => {
    await delay(1100);
    const { name, email, department, designation, govtId, password } = input;
    if (!name.trim() || !email.trim() || !department.trim() || !designation.trim() || !govtId.trim()) {
      return { ok: false, error: "Please fill in every field." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (users.some((u) => u.govtId.trim().toLowerCase() === govtId.trim().toLowerCase())) {
      return { ok: false, error: "This government ID is already registered." };
    }
    const newUser: StoredUser = {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      designation: designation.trim(),
      govtId: govtId.trim(),
      password,
    };
    writeUsers([...users, newUser]);
    const authUser: AuthUser = {
      name: newUser.name,
      email: newUser.email,
      department: newUser.department,
      designation: newUser.designation,
      govtId: newUser.govtId,
      role: "authority",
    };
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
