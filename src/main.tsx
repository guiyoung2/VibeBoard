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
      staleTime: 5 * 60 * 1000,
    },
  },
});

// 앱 시작 시 다크 모드 초기화 (렌더 전 먼저 처리)
useThemeStore.getState().initTheme();

// 홈 히어로 데이터를 React 렌더 전에 미리 요청해 LCP 체인을 단축한다.
const FEATURED_GAME_NAMES = ["할리갈리", "루미큐브", "스컬킹", "부루마블"];
queryClient.prefetchQuery({
  queryKey: ["popular-games", FEATURED_GAME_NAMES],
  staleTime: 5 * 60 * 1000,
  queryFn: async () => {
    const { data, error } = await supabase
      .from("boardgames")
      .select(
        "id, name, description, category, min_players, max_players, play_time, image_url",
      )
      .in("name", FEATURED_GAME_NAMES);
    if (error) throw error;
    const rows = (data as { name: string }[]) || [];
    return FEATURED_GAME_NAMES
      .map((n) => rows.find((r) => r.name === n))
      .filter(Boolean);
  },
});

// 앱 시작 시 세션 확인
useAuthStore.getState().checkSession();

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
