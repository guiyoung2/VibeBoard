import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

function Login() {
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setUser(data.user);
        setSession(data.session);
        navigate("/");
      } else {
        // 회원가입
        if (password !== confirmPassword) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        if (password.length < 6) {
          throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // 이메일 확인이 필요한 경우
        if (!data.session) {
          setError(
            "회원가입이 완료되었습니다. 이메일을 확인해주세요."
          );
          return;
        }

        // 회원가입 성공 시 자동 로그인
        setUser(data.user);
        setSession(data.session);
        navigate("/");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-bg-card p-8 rounded-2xl shadow-card">
        {/* 탭 전환 */}
        <div className="flex mb-8 bg-bg-muted rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              isLogin
                ? "bg-primary text-white shadow-card"
                : "text-text-sub hover:text-text-main"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              !isLogin
                ? "bg-primary text-white shadow-card"
                : "text-text-sub hover:text-text-main"
            }`}
          >
            회원가입
          </button>
        </div>

        <h1 className="text-3xl font-bold text-text-main mb-6 text-center">
          {isLogin ? "로그인" : "회원가입"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-xl hover:bg-primary-soft transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "처리 중..."
              : isLogin
              ? "로그인"
              : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
