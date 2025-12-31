import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BoardGame } from "../types/boardgame";
import GameCard from "../components/GameCard";

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
              boardgames.map((game) => <GameCard key={game.id} game={game} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Games;
