import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** 오프라인 시 상단 배너 표시, 온라인 복귀 시 자동 refetch */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      queryClient.invalidateQueries();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  if (isOnline) return null;

  return (
    <div
      className="sticky top-0 z-50 w-full py-3 px-4 text-center text-white text-sm font-medium"
      style={{ backgroundColor: "var(--color-accent)" }}
    >
      네트워크 연결이 끊겼습니다. 연결을 확인한 뒤 다시 시도해 주세요.
    </div>
  );
}
