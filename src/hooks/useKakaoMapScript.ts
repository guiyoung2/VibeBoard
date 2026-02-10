import { useState, useEffect } from "react";
import { hasKakaoJsKey } from "../lib/kakao";

const JS_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

export function useKakaoMapScript(): { mapReady: boolean; error: string | null } {
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!JS_KEY || !hasKakaoJsKey()) return;
    if (window.kakao?.maps) {
      setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      const k = window.kakao;
      if (k?.maps?.load) {
        k.maps.load(() => setMapReady(true));
      } else if (k?.maps) {
        setMapReady(true);
      }
    };
    script.onerror = () => {
      setError("지도 스크립트를 불러오지 못했습니다.");
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return { mapReady, error };
}
