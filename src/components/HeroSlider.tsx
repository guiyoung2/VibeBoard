import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BoardGame } from "../types/boardgame";

interface HeroSliderProps {
  gameNames: string[];
}

function HeroSlider({ gameNames }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <div className="relative h-96 md:h-[500px]">
        {featuredGames.map((game, index) => (
          <div
            key={game.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="grid md:grid-cols-2 h-full">
              {/* 이미지 영역 */}
              <div className="relative h-64 md:h-full bg-gray-100">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex flex-col justify-center px-8 py-12 md:px-12 md:py-16 bg-gradient-to-br from-blue-50 to-blue-100">
                <Link to={`/games/${game.id}`}>
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                    {game.name}
                  </h3>
                </Link>
                <p className="text-gray-700 mb-6 text-lg line-clamp-4">
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
                <div className="flex flex-wrap gap-4 text-gray-700 mb-6">
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

                <Link
                  to={`/games/${game.id}`}
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md w-fit"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 버튼 */}
      {featuredGames.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="이전"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="다음"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 인디케이터 */}
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
        </>
      )}
    </div>
  );
}

export default HeroSlider;
