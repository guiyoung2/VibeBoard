import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
    },
  },
});

// 앱 시작 시 세션 확인
useAuthStore.getState().checkSession();

// 앱 시작 시 다크 모드 초기화
useThemeStore.getState().initTheme();

// Supabase 인증 상태 변경 감지
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setUser(session?.user ?? null);
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </QueryClientProvider>,
);
