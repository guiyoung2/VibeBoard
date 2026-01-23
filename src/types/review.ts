export interface Review {
  id: string;
  boardgame_id: string;
  user_id: string;
  rating: number; // 1-5
  content: string;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  boardgame?: {
    id: string;
    name: string;
    image_url: string | null;
  };
  profile?: {
    id: string;
    nickname: string | null;
  };
}

export interface ReviewFormData {
  boardgame_id: string;
  rating: number;
  content: string;
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  profile?: {
    id: string;
    nickname: string | null;
  };
}
