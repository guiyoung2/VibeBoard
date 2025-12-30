import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface BoardGame {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  min_players: number | null;
  max_players: number | null;
  play_time: number | null;
  difficulty: number | null;
  image_url: string | null;
}

function Games() {
  const [searchQuery, setSearchQuery] = useState("");

  // Supabase에서 보드게임 데이터 가져오기
  const {
    data: boardgames,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boardgames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boardgames")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BoardGame[];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 추후 실제 검색 로직 구현
    console.log("검색어:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">게임 추천</h1>

        {/* 검색창 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="보드게임 이름으로 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              검색
            </button>
          </form>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <p className="text-gray-600">필터 기능이 여기에 들어갑니다</p>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <p>에러 발생: {error.message}</p>
          </div>
        )}

        {/* 게임 목록 */}
        {boardgames && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardgames.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">보드게임이 없습니다.</p>
              </div>
            ) : (
              boardgames.map((game) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer block"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded mb-4 overflow-hidden">
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
                  <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {game.description || "설명이 없습니다."}
                  </p>

                  {/* 카테고리 태그들 */}
                  {game.category && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {game.category
                        .split(",")
                        .map((cat) => cat.trim())
                        .filter((cat) => cat.length > 0)
                        .map((cat, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-medium border border-blue-200"
                          >
                            {cat}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* 게임 정보 */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    {game.min_players && game.max_players && (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg
                          className="w-4 h-4"
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
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <svg
                          className="w-4 h-4"
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
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Games;
