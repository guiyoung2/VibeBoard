import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900">
              VibeBoard
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/games"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/games")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                게임 추천
              </Link>
              <Link
                to="/reviews"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/reviews")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                게임 후기
              </Link>
              <Link
                to="/cafes"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/cafes")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                주변 매장 찾기
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-400">
            © 2025 VibeBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
