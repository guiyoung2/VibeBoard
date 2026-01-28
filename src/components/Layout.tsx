import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { NetworkStatus } from "./NetworkStatus";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, nickname, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg font-hakgyoansim">
      <NetworkStatus />
      {/* Header */}
      <header className="bg-bg-card shadow-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold text-primary hover:text-accent transition-colors"
            >
              VibeBoard
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/games"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/games")
                    ? `${isDark ? "bg-accent" : "bg-primary"} text-white shadow-card`
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                게임 추천
              </Link>
              <Link
                to="/reviews"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/reviews")
                    ? `${isDark ? "bg-accent" : "bg-primary"} text-white shadow-card`
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                게임 후기
              </Link>
              <Link
                to="/cafes"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/cafes")
                    ? `${isDark ? "bg-accent" : "bg-primary"} text-white shadow-card`
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                주변 매장 찾기
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* 다크 모드 토글 버튼 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-sub hover:text-text-main hover:bg-bg-muted transition-colors"
                aria-label="다크 모드 토글"
                title={theme === "light" ? "다크 모드" : "라이트 모드"}
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="text-sm text-text-sub hover:text-text-main transition-colors"
                  >
                    {nickname || user.email?.split("@")[0]}님
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-text-sub hover:text-text-main transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-text-sub hover:text-text-main transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className={`${isDark ? "bg-primary-soft" : "bg-primary"} mt-12`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p
            className={`text-center ${isDark ? "text-text-sub" : "text-white"}`}
          >
            © 2025 VibeBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
