import { useThemeStore } from "../stores/themeStore";

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
}

interface AuthFormProps {
  isLogin: boolean;
  onSwitchToLogin: () => void;
  onSwitchToSignUp: () => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nickname: string;
  onNicknameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldErrors: AuthFieldErrors;
  error: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthForm({
  isLogin,
  onSwitchToLogin,
  onSwitchToSignUp,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  nickname,
  onNicknameChange,
  fieldErrors,
  error,
  loading,
  onSubmit,
}: AuthFormProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const tabActiveClass = `${isDark ? "bg-accent" : "bg-primary"} text-white shadow-card`;
  const tabInactiveClass = "text-text-sub hover:text-text-main";

  return (
    <>
      <div className="flex mb-8 bg-bg-muted rounded-xl p-1">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            isLogin ? tabActiveClass : tabInactiveClass
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            !isLogin ? tabActiveClass : tabInactiveClass
          }`}
        >
          회원가입
        </button>
      </div>

      <h1 className="text-3xl font-bold text-text-main mb-6 text-center">
        {isLogin ? "로그인" : "회원가입"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={onNicknameChange}
              maxLength={6}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="닉네임을 입력하세요 (최대 6글자)"
            />
            {fieldErrors.nickname && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
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
            onChange={onEmailChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
            placeholder="이메일을 입력하세요"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-2">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={onPasswordChange}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
            placeholder="비밀번호를 입력하세요"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
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
              onChange={onConfirmPasswordChange}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-bg-card text-text-main"
              placeholder="비밀번호를 다시 입력하세요"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${isDark ? "bg-accent hover:bg-accent-hover" : "bg-primary hover:bg-primary-soft"} text-white py-3 px-4 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
        </button>

        {Object.keys(fieldErrors).length > 0 && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
              다음 항목을 확인해주세요:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
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
    </>
  );
}
