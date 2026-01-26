import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, nickname, signOut } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg font-hakgyoansim">
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
                    ? "bg-primary text-white shadow-card"
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                게임 추천
              </Link>
              <Link
                to="/reviews"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/reviews")
                    ? "bg-primary text-white shadow-card"
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                게임 후기
              </Link>
              <Link
                to="/cafes"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive("/cafes")
                    ? "bg-primary text-white shadow-card"
                    : "text-text-sub hover:bg-bg-muted hover:text-text-main"
                }`}
              >
                주변 매장 찾기
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
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
      <footer className="bg-primary text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-text-muted">
            © 2025 VibeBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
