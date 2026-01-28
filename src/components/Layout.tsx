import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { NetworkStatus } from "./NetworkStatus";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/games", label: "게임 추천" },
  { path: "/reviews", label: "게임 후기" },
  { path: "/cafes", label: "주변 매장 찾기" },
];

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, nickname, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-bg font-hakgyoansim">
      <NetworkStatus />
      {/* Header */}
      <header className="bg-bg-card shadow-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold text-primary hover:text-accent transition-colors"
              onClick={closeMobileMenu}
            >
              VibeBoard
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(path)
                      ? `${isDark ? "bg-accent" : "bg-primary"} text-white shadow-card`
                      : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right: Mobile menu button + User menu */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* 모바일: 햄버거 버튼 */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg text-text-sub hover:text-text-main hover:bg-bg-muted transition-colors"
                aria-label="메뉴 열기"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

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

              {/* 데스크톱에서만: 닉네임·로그인/로그아웃 (모바일은 햄버거 메뉴 안에만) */}
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  <>
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
                  </>
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
        </div>
      </header>

      {/* 모바일 메뉴 패널 */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden
          />
          <div
            className="fixed top-[57px] left-0 right-0 bg-bg-card border-b border-border shadow-card z-50 md:hidden animate-fade-in"
            style={{ animationFillMode: "both" }}
          >
            <nav className="flex flex-col py-2 px-4">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(path)
                      ? `${isDark ? "bg-accent" : "bg-primary"} text-white`
                      : "text-text-main hover:bg-bg-muted"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="px-4 py-3 rounded-xl text-base text-text-main hover:bg-bg-muted"
                  >
                    {nickname || user.email?.split("@")[0]}님
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-3 rounded-xl text-base text-left text-text-sub hover:bg-bg-muted w-full"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-base text-text-main hover:bg-bg-muted"
                >
                  로그인
                </Link>
              )}
            </nav>
          </div>
        </>
      )}

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
