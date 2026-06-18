export interface Question {
  id: number;
  question: string;
  answer: string;
  tip: string;
  category?: string;
}

export interface Team {
  id: number;
  name: string;
  score: number;
  color: string; // Tailwind color class prefix or hex code (e.g., 'emerald', 'sky')
}

export type GamePhase = 'setup' | 'playing' | 'tiebreaker' | 'victory';
