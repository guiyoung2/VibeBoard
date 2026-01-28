import { Link } from "react-router-dom";
import type { BoardGame } from "../types/boardgame";

interface GameCardProps {
  game: BoardGame;
  index?: number; // 애니메이션 딜레이용
}

function GameCard({ game, index }: GameCardProps) {
  return (
    <Link
      to={`/games/${game.id}`}
      className={`bg-bg-card p-6 rounded-lg shadow-card border border-border hover:shadow-hover transition-all cursor-pointer block ${
        index !== undefined ? "animate-fade-in" : ""
      }`}
      style={
        index !== undefined
          ? {
              animationDelay: `${index * 0.1}s`,
              animationFillMode: "both",
            }
          : {}
      }
    >
      <div className="w-full aspect-square bg-bg-muted rounded mb-4 overflow-hidden">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bg-muted"></div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-text-main">{game.name}</h3>
      <p className="text-text-sub mb-3 line-clamp-3">
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
                className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-text-main px-3 py-1 rounded-md text-xs font-medium border border-primary/20 dark:border-primary/30"
              >
                {cat}
              </span>
            ))}
        </div>
      )}

      {/* 게임 정보 */}
      <div className="flex flex-wrap gap-3 text-sm text-text-sub">
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
  );
}

export default GameCard;
