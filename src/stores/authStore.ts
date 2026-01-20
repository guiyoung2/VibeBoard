import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  checkSession: async () => {
    try {
      set({ loading: true });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });
    } catch (error) {
      console.error("세션 확인 오류:", error);
      set({ user: null, session: null, loading: false });
    }
  },
}));
