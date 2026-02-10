import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BoardGame } from "../types/boardgame";
import { useInfiniteDisplay } from "../hooks/useInfiniteDisplay";
import GameCard from "../components/GameCard";
import { Button } from "../components/Button";
import { ErrorMessageWithRetry } from "../components/ErrorMessageWithRetry";
import { SkeletonGameGrid } from "../components/Skeleton";

interface FilterState {
  players: number | null; // 2, 3, 4, 5, 6, 7 (7은 7인 이상)
  difficulty: number | null; // 1: 매우 쉬움, 2: 쉬움, 3: 보통, 4: 어려움, 5: 매우 어려움
  playTime: string | null; // "15이내", "15-30", "30-60", "60이상"
}

function Games() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    players: null,
    difficulty: null,
    playTime: null,
  });
  // Supabase에서 보드게임 데이터 가져오기
  const {
    data: boardgames,
    isLoading,
    error,
    refetch,
    isError,
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
    infiniteReset(3);
  };

  // 필터링된 게임 목록
  const filteredGames = useMemo(() => {
    if (!boardgames) return [];

    return boardgames.filter((game) => {
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !game.name.toLowerCase().includes(query) &&
          !game.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 인원수 필터
      if (filters.players !== null) {
        if (filters.players === 7) {
          // 7인 이상
          if (!game.max_players || game.max_players < 7) {
            return false;
          }
        } else {
          // 정확한 인원수
          if (
            !game.min_players ||
            !game.max_players ||
            game.min_players > filters.players ||
            game.max_players < filters.players
          ) {
            return false;
          }
        }
      }

      // 난이도 필터
      if (filters.difficulty !== null) {
        if (game.difficulty !== filters.difficulty) {
          return false;
        }
      }

      // 게임 시간 필터
      if (filters.playTime !== null && game.play_time !== null) {
        const playTime = game.play_time;
        switch (filters.playTime) {
          case "15이내":
            if (playTime > 15) return false;
            break;
          case "15-30":
            if (playTime < 15 || playTime > 30) return false;
            break;
          case "30-60":
            if (playTime < 30 || playTime > 60) return false;
            break;
          case "60이상":
            if (playTime < 60) return false;
            break;
        }
      }

      return true;
    });
  }, [boardgames, searchQuery, filters]);

  const {
    slicedItems: displayedGames,
    loadMoreRef,
    hasMore,
    prevDisplayCount,
    reset: infiniteReset,
  } = useInfiniteDisplay(filteredGames, { pageSize: 3, initialSize: 6 });

  const handleFilterChange = (
    type: keyof FilterState,
    value: number | string | null,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value,
    }));
    infiniteReset(3);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary dark:text-text-main mb-8">
          게임 추천
        </h1>

        {/* 검색창 */}
        <div className="bg-bg-card p-6 rounded-lg shadow-card border border-border mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                infiniteReset(3);
              }}
              placeholder="보드게임 이름으로 검색..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-bg-card text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" variant="primary" size="md">
              검색
            </Button>
          </form>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-bg-card p-6 rounded-lg shadow-card border border-border mb-8">
          <div className="space-y-6">
            {/* 인원수 필터 */}
            <div>
              <label className="block text-base font-bold text-text-main mb-3">
                인원수
              </label>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange("players", num)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.players === num
                        ? "bg-blue-600 text-white"
                        : "bg-bg-muted text-text-main hover:bg-bg hover:text-text-main"
                    }`}
                  >
                    {num === 7 ? "7인 이상" : `${num}인`}
                  </button>
                ))}
              </div>
            </div>

            {/* 난이도 필터 */}
            <div>
              <label className="block text-base font-bold text-text-main mb-3">
                난이도
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 1, label: "매우 쉬움" },
                  { value: 2, label: "쉬움" },
                  { value: 3, label: "보통" },
                  { value: 4, label: "어려움" },
                  { value: 5, label: "매우 어려움" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleFilterChange("difficulty", item.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.difficulty === item.value
                        ? "bg-blue-600 text-white"
                        : "bg-bg-muted text-text-main hover:bg-bg hover:text-text-main"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 게임 시간 필터 */}
            <div>
              <label className="block text-base font-bold text-text-main mb-3">
                게임 시간
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "15이내", label: "15분 이내" },
                  { value: "15-30", label: "15분~30분" },
                  { value: "30-60", label: "30분~60분" },
                  { value: "60이상", label: "60분 이상" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleFilterChange("playTime", item.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.playTime === item.value
                        ? "bg-blue-600 text-white"
                        : "bg-bg-muted text-text-main hover:bg-bg hover:text-text-main"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 필터 초기화 버튼 */}
            {(filters.players !== null ||
              filters.difficulty !== null ||
              filters.playTime !== null) && (
              <button
                onClick={() => {
                  setFilters({
                    players: null,
                    difficulty: null,
                    playTime: null,
                  });
                  infiniteReset(3);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* 로딩 상태 - 스켈레톤 */}
        {isLoading && <SkeletonGameGrid count={6} />}

        {/* 에러 상태 - 재시도 버튼 */}
        {isError && error && (
          <ErrorMessageWithRetry
            message="데이터를 불러오는 중 오류가 발생했습니다."
            detail={error.message}
            onRetry={() => refetch()}
            className="mb-8"
          />
        )}

        {/* 게임 목록 */}
        {boardgames && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-text-sub">
                  {searchQuery ||
                  filters.players !== null ||
                  filters.difficulty !== null ||
                  filters.playTime !== null
                    ? "검색 결과가 없습니다."
                    : "보드게임이 없습니다."}
                </p>
              </div>
            ) : (
              <>
                {displayedGames.map((game, index) => {
                  // 새로 추가된 카드들에만 애니메이션 적용
                  const isNewCard = index >= prevDisplayCount;
                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      index={isNewCard ? index - prevDisplayCount : undefined}
                    />
                  );
                })}
                {/* 무한 스크롤 트리거 요소 */}
                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="col-span-full flex justify-center items-center py-8"
                  >
                    <div className="text-text-muted text-sm">로딩 중...</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Games;
