import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

function AuthCallback() {
  const navigate = useNavigate();
  const { setUser, setSession, fetchNickname } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // OAuth 콜백 후 URL hash에서 세션 정보 가져오기
        // Supabase는 OAuth 콜백 후 URL hash에 세션 정보를 포함합니다
        // 2026년 기준: getSession()과 URL hash 모두 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("세션 가져오기 오류:", error);
          navigate("/auth/login?error=auth_failed", { replace: true });
          return;
        }

        // 세션과 사용자 정보 확인
        const session = data.session;
        const user = session?.user;

        if (session && user) {
          // 기존 세션 정리 후 새 세션 설정
          setUser(user);
          setSession(session);

          // 닉네임 가져오기
          await fetchNickname(user.id);

          // URL hash 정리 (보안을 위해)
          window.history.replaceState({}, document.title, window.location.pathname);

          // 홈으로 리다이렉트 (닉네임은 프로필 페이지에서 수정 가능)
          navigate("/", { replace: true });
        } else {
          // 세션이 없으면 로그인 페이지로
          navigate("/auth/login?error=no_session", { replace: true });
        }
      } catch (err) {
        console.error("인증 콜백 처리 오류:", err);
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
        navigate(`/auth/login?error=${encodeURIComponent(errorMessage)}`, { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, setUser, setSession, fetchNickname]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-main">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
