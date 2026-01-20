import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { useAuthStore } from "./stores/authStore";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

// 앱 시작 시 세션 확인
useAuthStore.getState().checkSession();

// Supabase 인증 상태 변경 감지
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setUser(session?.user ?? null);
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
