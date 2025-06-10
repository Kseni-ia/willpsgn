export interface Word {
  id: number;
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
}

export interface GameStats {
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  bestStreak: number;
}

export type ExerciseType = "definition" | "synonym" | "antonym" | "memory";

export interface GameState {
  currentExercise: ExerciseType | null;
  stats: GameStats;
  progress: number;
  selectedWords: Word[];
  matchedPairs: Set<number>;
}
