import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

function Login() {
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setLocalNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    nickname?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setSession, setNickname, fetchNickname } = useAuthStore();

  // 이메일 형식 검증 (아이디@주소.com)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // 비밀번호 검증 (영어+숫자 포함, 8자 이상)
  const validatePassword = (password: string): boolean => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= 8 && hasLetter && hasNumber;
  };

  // 닉네임 검증 (한글 기준 6글자 이하)
  const validateNickname = (nickname: string): boolean => {
    return nickname.length > 0 && nickname.length <= 6;
  };

  // 입력값만 업데이트 (실시간 검증 제거)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalNickname(e.target.value);
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: "google" | "github" | "kakao") => {
    setLoading(true);
    setError(null);

    try {
      // 각 제공자별로 계정 선택 화면을 강제로 표시하는 옵션 설정
      const queryParams: Record<string, string> = {};
      
      if (provider === "google") {
        // Google: 계정 선택 화면 강제 표시
        queryParams.prompt = "select_account";
      } else if (provider === "github") {
        // GitHub: 계정 선택 화면 강제 표시 (2024년 6월부터 지원)
        queryParams.prompt = "select_account";
      } else if (provider === "kakao") {
        // Kakao: 계정 선택 화면 강제 표시
        queryParams.prompt = "select_account";
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams,
        },
      });

      if (error) throw error;

      // OAuth는 리다이렉트되므로 여기서는 에러만 처리
      // 실제 로그인 처리는 callback 페이지에서 처리
      // 리다이렉트되므로 loading 상태는 유지 (페이지가 이동하므로)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "소셜 로그인 중 오류가 발생했습니다.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // 빈 필드 검증
    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "이메일을 입력해주세요",
      }));
      return;
    }

    if (!password.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "비밀번호를 입력해주세요",
      }));
      return;
    }

    if (!isLogin) {
      if (!nickname.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          nickname: "닉네임을 입력해주세요",
        }));
        return;
      }

      if (!confirmPassword.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "비밀번호 확인을 입력해주세요",
        }));
        return;
      }
    }

    // 형식 검증
    if (!validateEmail(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "올바른 이메일 형식을 입력해주세요 (예: user@example.com)",
      }));
      return;
    }

    if (!validatePassword(password)) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "비밀번호는 영어와 숫자를 포함하여 8자 이상이어야 합니다",
      }));
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "비밀번호가 일치하지 않습니다",
        }));
        return;
      }

      if (!validateNickname(nickname)) {
        setFieldErrors((prev) => ({
          ...prev,
          nickname: "닉네임은 한글 기준 6글자 이하여야 합니다",
        }));
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 로그인
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // 회원정보가 없는 경우
          if (
            error.message === "Invalid login credentials" ||
            error.message.includes("Invalid login credentials")
          ) {
            setError("등록된 회원정보가 없습니다. 이메일과 비밀번호를 확인해주세요.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
          } else {
            setError(error.message || "로그인 중 오류가 발생했습니다.");
          }
          return;
        }

        setUser(data.user);
        setSession(data.session);
        // 로그인 후 닉네임 가져오기
        if (data.user) {
          await fetchNickname(data.user.id);
        }
        navigate("/");
      } else {
        // 회원가입
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // profiles 테이블에 닉네임 저장 (Trigger로 행은 이미 생성됨)
        // 이메일 확인 여부와 관계없이 닉네임은 저장해야 함
        if (data.user) {
          // SECURITY DEFINER 함수를 사용하여 RLS 우회
          const { error: profileError } = await supabase.rpc("update_user_nickname", {
            user_id: data.user.id,
            new_nickname: nickname,
          });

          if (profileError) {
            // 프로필 저장 실패해도 계속 진행
          } else {
            // 닉네임 저장 성공 시 바로 상태에 반영
            setNickname(nickname);
          }
        }

        // 이메일 확인이 필요한 경우
        if (!data.session) {
          setError("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
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
              setFieldErrors({});
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
              setFieldErrors({});
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                maxLength={6}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
                placeholder="닉네임을 입력하세요 (최대 6글자)"
              />
              {fieldErrors.nickname && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.nickname}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              이메일
            </label>
            <input
              type="text"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="이메일을 입력하세요"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="비밀번호를 입력하세요"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
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

          {/* 전체 오류 메시지 (버튼 아래) */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-600 mb-1">
                다음 항목을 확인해주세요:
              </p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                {fieldErrors.email && <li>{fieldErrors.email}</li>}
                {fieldErrors.password && <li>{fieldErrors.password}</li>}
                {fieldErrors.confirmPassword && (
                  <li>{fieldErrors.confirmPassword}</li>
                )}
                {fieldErrors.nickname && <li>{fieldErrors.nickname}</li>}
              </ul>
            </div>
          )}
        </form>

        {/* 소셜 로그인 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-bg-card text-text-sub">또는</span>
          </div>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border text-text-main py-3 px-4 rounded-xl hover:bg-bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 로그인
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white py-3 px-4 rounded-xl hover:bg-[#2d3339] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub로 로그인
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#000000] py-3 px-4 rounded-xl hover:bg-[#FDD835] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.8 5.1 4.5 6.3L5.4 21l4.2-2.1c.6.1 1.2.1 1.8.1 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"
                fill="currentColor"
              />
            </svg>
            Kakao로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
