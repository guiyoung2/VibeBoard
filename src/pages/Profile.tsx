import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";

function Profile() {
  const navigate = useNavigate();
  const { user, nickname, fetchNickname } = useAuthStore();
  const [nicknameInput, setNicknameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // 현재 닉네임을 초기값으로 설정
  useEffect(() => {
    if (nickname) {
      setNicknameInput(nickname);
    }
  }, [nickname]);

  // 닉네임 검증 (한글 기준 6글자 이하)
  const validateNickname = (nickname: string): boolean => {
    return nickname.length > 0 && nickname.length <= 6;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNicknameInput(value);
    setFieldError(null);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccess(false);

    // 닉네임 검증
    if (!nicknameInput.trim()) {
      setFieldError("닉네임을 입력해주세요.");
      return;
    }

    if (!validateNickname(nicknameInput.trim())) {
      setFieldError("닉네임은 6글자 이하로 입력해주세요.");
      return;
    }

    // 변경사항이 없으면 리턴
    if (nicknameInput.trim() === nickname) {
      setError("변경된 내용이 없습니다.");
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
          new_nickname: nicknameInput.trim(),
        },
      );

      if (updateError) {
        throw updateError;
      }

      // 닉네임 가져오기
      await fetchNickname(user.id);

      setSuccess(true);
      setLoading(false);

      // 2초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "닉네임 수정 중 오류가 발생했습니다.";
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
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary dark:text-text-main mb-8">
          프로필 설정
        </h1>

        <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border">
          <h2 className="text-2xl font-bold text-text-main mb-6">
            닉네임 수정
          </h2>

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
                value={nicknameInput}
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldError}
                </p>
              )}
              <p className="mt-1 text-xs text-text-sub">
                {nicknameInput.length}/6 글자
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                <p className="text-sm">닉네임이 성공적으로 변경되었습니다.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                !nicknameInput.trim() ||
                nicknameInput.trim() === nickname
              }
              className={`w-full ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "수정 중..." : "닉네임 수정하기"}
            </button>
          </form>

          {/* 사용자 정보 */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-text-main mb-4">
              계정 정보
            </h3>
            <div className="space-y-2 text-text-sub">
              <p>
                <span className="font-medium text-text-main">이메일:</span>{" "}
                {user.email}
              </p>
              <p>
                <span className="font-medium text-text-main">로그인 방식:</span>{" "}
                {user.app_metadata?.provider === "email"
                  ? "이메일"
                  : user.app_metadata?.provider === "google"
                    ? "Google"
                    : user.app_metadata?.provider === "github"
                      ? "GitHub"
                      : user.app_metadata?.provider === "kakao"
                        ? "Kakao"
                        : "소셜 로그인"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
