import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  nickname: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setNickname: (nickname: string | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  fetchNickname: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  nickname: null,
  loading: true,
  setUser: (user) => {
    set({ user });
    if (user) {
      get().fetchNickname(user.id);
    } else {
      set({ nickname: null });
    }
  },
  setSession: (session) => set({ session }),
  setNickname: (nickname) => set({ nickname }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, nickname: null });
  },
  fetchNickname: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single();

      if (error) throw error;
      set({ nickname: data?.nickname || null });
    } catch (error) {
      console.error("닉네임 가져오기 오류:", error);
      set({ nickname: null });
    }
  },
  checkSession: async () => {
    try {
      set({ loading: true });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      set({ session, user, loading: false });
      if (user) {
        get().fetchNickname(user.id);
      }
    } catch (error) {
      console.error("세션 확인 오류:", error);
      set({ user: null, session: null, nickname: null, loading: false });
    }
  },
}));
