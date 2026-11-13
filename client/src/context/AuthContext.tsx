import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase.js";
import { UserProfile } from "../types/index.js";
import { api } from "../lib/api-client.js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isDevMode: boolean;
  loginAsDevFarmer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  // Fetch or refresh user profile
  const fetchProfile = async () => {
    try {
      const res = await api.get<UserProfile>("/profile");
      if (res.data) {
        setProfile(res.data);
      }
    } catch {
      // Profile might not exist yet; provide fallback
    }
  };

  useEffect(() => {
    // 1. Check for active Supabase session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile();
      } else {
        // Check for local dev token
        let devToken: string | null = null;
        let devEmail: string | null = null;
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            devToken = window.localStorage.getItem("agrisage_dev_token");
            devEmail = window.localStorage.getItem("agrisage_dev_email");
          }
        } catch {}
        if (devToken && devEmail) {
          setIsDevMode(true);
          const mockUser = {
            id: devToken.replace("dev-test-token-", ""),
            email: devEmail,
            app_metadata: {},
            user_metadata: { full_name: "Ramesh Gowda" },
            aud: "authenticated",
            created_at: new Date().toISOString(),
          } as unknown as User;
          setUser(mockUser);
          setProfile({
            id: mockUser.id,
            full_name: "Ramesh Gowda",
            preferred_language: "en",
            state: "Karnataka",
            district: "Mandya",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setIsDevMode(false);
        fetchProfile();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      setUser(data.user);
      setSession(data.session);
      await fetchProfile();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      return { success: false, error: msg };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign up";
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("agrisage_dev_token");
        window.localStorage.removeItem("agrisage_dev_email");
      }
    } catch {}
    setIsDevMode(false);
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      return { success: false, error: msg };
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const res = await api.patch<UserProfile>("/profile", data);
    if (res.data) {
      setProfile(res.data);
    }
  };

  // Instant demo login for local review
  const loginAsDevFarmer = () => {
    const devId = "11111111-2222-3333-4444-555555555555";
    const devToken = `dev-test-token-${devId}`;
    const devEmail = "ramesh.farmer@agrisage.in";
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("agrisage_dev_token", devToken);
        window.localStorage.setItem("agrisage_dev_email", devEmail);
      }
    } catch {}
    setIsDevMode(true);
    const mockUser = {
      id: devId,
      email: devEmail,
      app_metadata: {},
      user_metadata: { full_name: "Ramesh Gowda" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User;
    setUser(mockUser);
    setProfile({
      id: devId,
      full_name: "Ramesh Gowda",
      preferred_language: "en",
      state: "Karnataka",
      district: "Mandya",
      phone: "+91 9876543210",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateUserProfile,
        isDevMode,
        loginAsDevFarmer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
