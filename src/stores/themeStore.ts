import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

// localStorage에서 테마 가져오기
const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  // 저장된 값이 없으면 시스템 설정 확인
  if (!stored) {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  }
  return stored;
};

// localStorage에 테마 저장
const setStoredTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
};

// HTML 클래스에 다크 모드 적용
const applyTheme = (theme: "light" | "dark") => {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  // 초기화
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme: Theme) => {
      set({ theme });
      setStoredTheme(theme);
      applyTheme(theme);
    },
    toggleTheme: () => {
      const current = get().theme;
      const newTheme: Theme = current === "light" ? "dark" : "light";
      set({ theme: newTheme });
      setStoredTheme(newTheme);
      applyTheme(newTheme);
    },
    initTheme: () => {
      const stored = getStoredTheme();
      set({ theme: stored });
      applyTheme(stored);
    },
  };
});
