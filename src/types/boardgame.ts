export interface BoardGame {
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
