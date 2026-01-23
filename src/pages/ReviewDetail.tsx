import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Review, Comment } from "../types/review";

function ReviewDetail() {
  const { id } = useParams<{ id: string }>();

  // 예시 리뷰 데이터 (하드코딩) - 실제로는 id로 찾아야 함
  const exampleReviews: Review[] = [
    {
      id: "1",
      boardgame_id: "1",
      user_id: "1",
      rating: 5,
      content:
        "정말 재미있는 보드게임이에요! 친구들과 함께 플레이했는데 모두가 즐거워했어요. 전략적 요소도 있고 운도 있어서 매번 다른 결과가 나와서 좋습니다. 특히 중반부부터 긴장감이 올라가는 게임플레이가 인상적이었어요.\n\n추가로 말씀드리면, 게임 시간도 적당하고 규칙도 복잡하지 않아서 초보자도 쉽게 즐길 수 있을 것 같아요. 다만 승리 조건을 잘 이해해야 전략을 세울 수 있으니 처음 플레이하는 분들은 설명을 잘 듣는 게 중요할 것 같습니다.",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
      boardgame: {
        id: "1",
        name: "카탄의 개척자들",
        image_url: null,
      },
      profile: {
        id: "1",
        nickname: "보드게임러버",
      },
    },
    {
      id: "2",
      boardgame_id: "2",
      user_id: "2",
      rating: 4,
      content:
        "처음 해보는 보드게임인데 생각보다 쉽게 배울 수 있어서 좋았어요. 규칙이 복잡해 보였지만 실제로는 직관적이고, 게임 시간도 적당해서 부담스럽지 않았습니다. 다만 승리 조건이 조금 애매한 부분이 있어서 4점 드립니다.\n\n게임 구성품의 퀄리티도 좋고, 설명서도 잘 되어 있어서 혼자서도 충분히 이해할 수 있었어요. 친구들과 함께 하면 더 재미있을 것 같습니다.",
      created_at: "2024-01-20T14:15:00Z",
      updated_at: "2024-01-20T14:15:00Z",
      boardgame: {
        id: "2",
        name: "스플렌더",
        image_url: null,
      },
      profile: {
        id: "2",
        nickname: "게임마스터",
      },
    },
    {
      id: "3",
      boardgame_id: "3",
      user_id: "3",
      rating: 5,
      content:
        "가족과 함께 즐기기 완벽한 게임입니다! 아이들도 쉽게 이해할 수 있고, 어른들도 전략을 세우며 즐길 수 있어서 세대를 불문하고 모두가 즐거워했어요. 특히 게임 중간중간 웃음이 터져나와서 분위기가 정말 좋았습니다.\n\n게임 시간도 30분 정도로 적당해서 아이들의 집중력도 유지할 수 있었고, 반복해서 플레이해도 지루하지 않았어요. 가족 모임이나 친구들과 함께 할 때 강력 추천합니다!",
      created_at: "2024-01-25T09:45:00Z",
      updated_at: "2024-01-25T09:45:00Z",
      boardgame: {
        id: "3",
        name: "할리갈리",
        image_url: null,
      },
      profile: {
        id: "3",
        nickname: "패밀리게이머",
      },
    },
  ];

  // 댓글 작성 상태
  const [commentContent, setCommentContent] = useState("");

  // 예시 댓글 데이터 (하드코딩) - 실제로는 review_id로 찾아야 함
  const exampleComments: Comment[] = [
    {
      id: "1",
      review_id: "1",
      user_id: "2",
      content: "저도 이 게임 정말 좋아해요! 특히 중반부 전략이 중요하다는 점에 동감합니다.",
      created_at: "2024-01-16T09:20:00Z",
      updated_at: "2024-01-16T09:20:00Z",
      profile: {
        id: "2",
        nickname: "게임마스터",
      },
    },
    {
      id: "2",
      review_id: "1",
      user_id: "3",
      content: "처음 플레이하는 분들에게도 추천할 만한 게임이네요. 다음에 한번 해봐야겠어요!",
      created_at: "2024-01-17T14:30:00Z",
      updated_at: "2024-01-17T14:30:00Z",
      profile: {
        id: "3",
        nickname: "패밀리게이머",
      },
    },
    {
      id: "3",
      review_id: "2",
      user_id: "1",
      content: "규칙이 직관적이라는 점 정말 공감해요. 설명서만 봐도 바로 이해할 수 있었어요.",
      created_at: "2024-01-21T11:15:00Z",
      updated_at: "2024-01-21T11:15:00Z",
      profile: {
        id: "1",
        nickname: "보드게임러버",
      },
    },
  ];

  // 평점을 별표로 표시하는 함수 (채워진 별만)
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  // id로 리뷰 찾기
  const review = exampleReviews.find((r) => r.id === id);

  // 해당 리뷰의 댓글 목록
  const comments = exampleComments.filter((c) => c.review_id === id);

  // 댓글 작성 핸들러 (하드코딩이므로 state만 업데이트)
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    // 하드코딩이므로 실제로는 Supabase에 저장해야 함
    // 지금은 alert로 확인만
    alert("댓글이 작성되었습니다. (하드코딩 모드에서는 실제 저장되지 않습니다.)");
    setCommentContent("");
  };

  if (!review) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>리뷰를 찾을 수 없습니다.</p>
            <Link
              to="/reviews"
              className="text-accent underline mt-2 inline-block"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/reviews"
          className="text-accent hover:text-accent/80 mb-4 inline-block transition-colors"
        >
          ← 목록으로
        </Link>

        <div className="bg-bg-card p-8 rounded-xl shadow-card border border-border">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
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
              <div className="text-2xl mb-2">{renderStars(review.rating)}</div>
              <p className="text-lg font-semibold text-text-main">
                {review.rating} / 5점
              </p>
            </div>
          </div>

          {/* 게임 정보 */}
          {review.boardgame && (
            <div className="mb-6 pb-6 border-b border-border">
              <div className="inline-flex items-center gap-3">
                {review.boardgame.image_url && (
                  <img
                    src={review.boardgame.image_url}
                    alt={review.boardgame.name}
                    className="w-16 h-16 object-cover rounded-lg"
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

          {/* 리뷰 내용 */}
          <div>
            <h2 className="text-xl font-semibold text-text-main mb-4">
              리뷰 내용
            </h2>
            <p className="text-text-main leading-relaxed whitespace-pre-wrap text-lg">
              {review.content}
            </p>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-8 bg-bg-card p-8 rounded-xl shadow-card border border-border">
          <h2 className="text-2xl font-bold text-primary mb-6">
            댓글 ({comments.length})
          </h2>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                댓글 작성
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-bg rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">
                        {comment.profile?.nickname?.[0] || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-main">
                          {comment.profile?.nickname || "익명 사용자"}
                        </h3>
                        <p className="text-sm text-text-sub">
                          {new Date(comment.created_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-sub">
              <p>아직 작성된 댓글이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
