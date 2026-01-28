import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { BoardGame } from "../types/boardgame";
import { SkeletonDetail } from "../components/Skeleton";

function GameDetail() {
  const { id } = useParams<{ id: string }>();

  // 난이도 텍스트 변환 함수
  const getDifficultyText = (difficulty: number | null): string => {
    if (!difficulty) return "";
    const difficultyMap: { [key: number]: string } = {
      1: "매우 쉬움",
      2: "쉬움",
      3: "보통",
      4: "어려움",
      5: "매우 어려움",
    };
    return difficultyMap[difficulty] || "";
  };

  // UUID로 보드게임 데이터 가져오기
  const {
    data: game,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["boardgame", id],
    queryFn: async () => {
      if (!id) throw new Error("ID가 없습니다");

      const { data, error } = await supabase
        .from("boardgames")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BoardGame;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <SkeletonDetail />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <p className="text-text-main font-medium mb-2">
              보드게임을 불러오는 중 오류가 발생했습니다.
            </p>
            <p className="text-text-sub text-sm mb-4">
              {error instanceof Error
                ? error.message
                : "데이터를 찾을 수 없습니다."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg text-white bg-accent hover:bg-accent-hover font-medium"
              >
                다시 시도
              </button>
              <Link
                to="/games"
                className="px-4 py-2 rounded-lg border border-border text-text-main hover:bg-bg-muted inline-block"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/games"
          className="text-accent hover:text-accent-hover mb-4 inline-block"
        >
          ← 목록으로
        </Link>

        <div className="bg-bg-card p-8 rounded-lg shadow-card border border-border">
          {/* 이미지 */}
          <div className="w-full max-w-xl mx-auto mb-6">
            {game.image_url ? (
              <img
                src={game.image_url}
                alt={game.name}
                className="w-full h-auto rounded-lg shadow-md object-contain"
              />
            ) : (
              <div className="w-full aspect-video bg-bg-muted rounded-lg"></div>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-4xl font-bold text-text-main mb-4">
            {game.name}
          </h1>

          {/* 카테고리 */}
          {game.category && (
            <div className="flex flex-wrap gap-2 mb-4">
              {game.category
                .split(",")
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0)
                .map((cat, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-text-main px-3 py-1 rounded-md text-xs font-medium border border-primary/20 dark:border-primary/30"
                  >
                    {cat}
                  </span>
                ))}
            </div>
          )}

          {/* 설명 */}
          <p className="text-text-main mb-6 text-lg leading-relaxed">
            {game.description || "설명이 없습니다."}
          </p>

          {/* 게임 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            {game.min_players && game.max_players && (
              <div>
                <p className="text-sm text-text-sub mb-1">인원수</p>
                <p className="text-lg font-semibold text-text-main">
                  {game.min_players}-{game.max_players}명
                </p>
              </div>
            )}
            {game.play_time && (
              <div>
                <p className="text-sm text-text-sub mb-1">플레이 시간</p>
                <p className="text-lg font-semibold text-text-main">
                  {game.play_time}분
                </p>
              </div>
            )}
            {game.difficulty && (
              <div>
                <p className="text-sm text-text-sub mb-1">난이도</p>
                <p className="text-lg font-semibold text-text-main">
                  {getDifficultyText(game.difficulty)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
