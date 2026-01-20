import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BoardGame } from "../types/boardgame";

interface HeroSliderProps {
  gameNames: string[];
}

function HeroSlider({ gameNames }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // name 값으로 보드게임 가져오기
  const { data: featuredGames, isLoading } = useQuery({
    queryKey: ["popular-games", gameNames],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boardgames")
        .select("*")
        .in("name", gameNames);

      if (error) throw error;
      return (data as BoardGame[]) || [];
    },
  });

  const nextSlide = () => {
    if (featuredGames) {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }
  };

  const prevSlide = () => {
    if (featuredGames) {
      setCurrentIndex(
        (prev) => (prev - 1 + featuredGames.length) % featuredGames.length
      );
    }
  };

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    if (!isDragging || !featuredGames) return;

    const diff = startX - currentX;
    const threshold = 50; // 최소 드래그 거리

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // 오른쪽으로 드래그 (다음 슬라이드)
        nextSlide();
      } else {
        // 왼쪽으로 드래그 (이전 슬라이드)
        prevSlide();
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // 터치 이벤트 (모바일)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !featuredGames) return;

    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // 5초마다 자동 슬라이드
  useEffect(() => {
    if (!featuredGames || featuredGames.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredGames, isDragging]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!featuredGames || featuredGames.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">인기 보드게임이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 슬라이드 컨테이너 */}
      <div
        ref={sliderRef}
        className="relative min-h-[600px] md:h-[500px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {featuredGames.map((game, index) => (
          <div
            key={game.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            style={{ pointerEvents: isDragging ? "none" : "auto" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* 이미지 영역 */}
              <div className="relative h-64 md:h-full bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex flex-col justify-center h-full px-8 py-8 md:px-12 md:py-12 bg-gradient-to-br from-blue-50 to-blue-100">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {game.name}
                </h3>
                <p className="text-gray-700 mb-6 text-lg line-clamp-3 md:line-clamp-4">
                  {game.description || "설명이 없습니다."}
                </p>

                {/* 카테고리 태그들 */}
                {game.category && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {game.category
                      .split(",")
                      .map((cat) => cat.trim())
                      .filter((cat) => cat.length > 0)
                      .map((cat, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                  </div>
                )}

                {/* 게임 정보 */}
                <div className="flex flex-wrap gap-4 text-gray-700">
                  {game.min_players && game.max_players && (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {game.min_players}-{game.max_players}명
                    </span>
                  )}
                  {game.play_time && (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {game.play_time}분
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      {featuredGames.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredGames.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroSlider;
