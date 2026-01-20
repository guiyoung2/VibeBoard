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
            console.error("프로필 저장 오류:", profileError);
            console.error("오류 상세:", JSON.stringify(profileError, null, 2));
            // 프로필 저장 실패해도 계속 진행
          } else {
            console.log("닉네임 저장 성공:", nickname);
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
      </div>
    </div>
  );
}

export default Login;
