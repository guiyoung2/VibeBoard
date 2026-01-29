import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // sessionStorage: 탭/창을 닫으면 로그아웃됨
    // localStorage로 바꾸면 브라우저를 닫아도 로그인 유지 (기본값)
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  },
});
