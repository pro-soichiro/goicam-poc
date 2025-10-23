// Quiz timing constants
export const TIME_LIMIT_MS = 20000;
export const TIME_LIMIT_PERCENTAGE = 100;
export const TIMER_UPDATE_INTERVAL_MS = 3;

// Score calculation constants
export const SCORE = {
  BASE: 100,
  COMBO_BONUS_PER_STREAK: 50,
};

// Combo threshold
export const COMBO_THRESHOLD = 2;

// Quiz session constants
export const QUESTIONS_PER_QUIZ = 5;

// Spaced repetition intervals (in days)
export const INTERVALS = [1, 2, 4, 7, 14, 30];

// Progress stages
export const STAGES = {
  MIN: 0,
  MAX: 5,
};

// Learning modes
export const MODES = {
  MEANING: 'meaning',
  WORD: 'word',
};

// Quiz modes
export const QUIZ_MODES = {
  TODAY: 'today',
  ALL: 'all',
  MINI: 'mini',
};

// Stage thresholds for mode advancement
export const STAGE_THRESHOLD_FOR_WORD_MODE = 2;

// Number of choices in quiz
export const NUM_CHOICES = 4;

// Date constants
export const STREAK_BREAK_THRESHOLD_DAYS = 1;
