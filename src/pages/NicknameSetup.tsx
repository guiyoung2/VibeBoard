import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

function NicknameSetup() {
  const navigate = useNavigate();
  const { user, fetchNickname } = useAuthStore();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // 닉네임 검증 (한글 기준 6글자 이하)
  const validateNickname = (nickname: string): boolean => {
    return nickname.length > 0 && nickname.length <= 6;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setFieldError(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    // 닉네임 검증
    if (!nickname.trim()) {
      setFieldError("닉네임을 입력해주세요.");
      return;
    }

    if (!validateNickname(nickname.trim())) {
      setFieldError("닉네임은 6글자 이하로 입력해주세요.");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      // 닉네임 저장
      const { error: updateError } = await supabase.rpc(
        "update_user_nickname",
        {
          user_id: user.id,
          new_nickname: nickname.trim(),
        },
      );

      if (updateError) {
        throw updateError;
      }

      // 닉네임 가져오기
      await fetchNickname(user.id);

      // 홈으로 리다이렉트
      navigate("/", { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "닉네임 설정 중 오류가 발생했습니다.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border text-center">
            <p className="text-text-main mb-4">로그인이 필요합니다.</p>
            <button
              onClick={() => navigate("/auth/login")}
              className={`${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white px-6 py-2 rounded-lg transition-colors`}
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border">
          <h1 className="text-3xl font-bold text-primary dark:text-text-main mb-2">
            닉네임 설정
          </h1>
          <p className="text-text-sub mb-6">
            활동에 사용할 닉네임을 설정해주세요. (최대 6글자)
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-bold text-text-main mb-2"
              >
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임을 입력하세요"
                maxLength={6}
                className={`w-full px-4 py-3 border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 ${
                  fieldError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                disabled={loading}
              />
              {fieldError && (
                <p className="mt-1 text-sm text-red-600">{fieldError}</p>
              )}
              <p className="mt-1 text-xs text-text-sub">
                {nickname.length}/6 글자
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nickname.trim()}
              className={`w-full ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "설정 중..." : "닉네임 설정하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NicknameSetup;
