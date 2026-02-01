/**
 * 배포 환경에서 리뷰 작성/등록을 막을 때 사용합니다.
 * 로컬: .env에 VITE_ALLOW_REVIEW_CREATE=true 추가
 * 배포(Vercel 등): 이 변수를 설정하지 않거나 false로 두면 리뷰 작성 불가
 */
export const allowReviewCreate =
  import.meta.env.VITE_ALLOW_REVIEW_CREATE === "true";
