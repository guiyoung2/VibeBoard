import type { Review } from "../types/review";
import { StarRating } from "./StarRating";

interface ReviewDetailHeaderProps {
  review: Review;
}

export function ReviewDetailHeader({ review }: ReviewDetailHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
            <span className="text-primary dark:text-text-main font-semibold text-xl">
              {review.profile?.nickname?.[0] || "U"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main mb-1">
              {review.profile?.nickname || "익명 사용자"}의 리뷰
            </h1>
            <p className="text-sm text-text-sub">
              {new Date(review.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <StarRating value={review.rating} />
          </div>
          <p className="text-lg font-semibold text-text-main">
            {review.rating} / 5점
          </p>
        </div>
      </div>

      {review.boardgame && (
        <div className="mb-6 pb-6 border-b border-border">
          <div className="inline-flex items-center gap-3">
            {review.boardgame.image_url && (
              <img
                src={review.boardgame.image_url}
                alt={review.boardgame.name}
                className="w-16 h-16 object-cover rounded-lg"
                width={64}
                height={64}
              />
            )}
            <div>
              <p className="text-sm text-text-sub mb-1">리뷰한 게임</p>
              <p className="text-xl font-bold text-accent">
                {review.boardgame.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
