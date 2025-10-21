# ゴイキャン Next.js 移行プロンプト

## 概要

現在のHTML単一ファイルアプリケーション（`app/index.html`）を、Next.js + TypeScript + Tailwind CSSのモダンなWebアプリケーションに移行してください。

## 前提条件

- `specification.md` を熟読し、アプリケーションの全機能と仕様を理解すること
- `app/index.html` の既存実装を参考にすること
- すべての機能を維持し、同じUXを提供すること

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **React 18**

## プロジェクト構造

```
goicam-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── StartScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── quiz.ts
│   │   ├── storage.ts
│   │   └── constants.ts
│   └── data/
│       └── questions.json
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 実装ステップ

### ステップ 1: プロジェクトセットアップ

1. **Next.jsプロジェクトの作成**
   ```bash
   npx create-next-app@latest goicam-nextjs --typescript --tailwind --app --no-src-dir
   # ↑実行後、以下を選択：
   # ✔ Would you like to use TypeScript? Yes
   # ✔ Would you like to use ESLint? Yes
   # ✔ Would you like to use Tailwind CSS? Yes
   # ✔ Would you like to use `src/` directory? Yes
   # ✔ Would you like to use App Router? Yes
   # ✔ Would you like to customize the default import alias? No
   ```

2. **必要な依存関係の追加**
   ```bash
   cd goicam-nextjs
   npm install
   ```

### ステップ 2: 型定義の作成

`src/types/index.ts` に以下の型を定義：

```typescript
// 問題データの型
export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  date: string;
}

export interface Question {
  id: number;
  term: string;
  correct: string;
  incorrect: string[];
  recallIncorrect: string[];
  explanation: string;
  example: string;
  newsArticles?: NewsArticle[];
}

// クイズモードの型
export type QuizMode = 'meaning' | 'recall' | 'mixed';

// 選択肢の型
export interface Choice {
  text: string;
  isCorrect: boolean;
}

// クイズセッションの型
export interface QuizSession {
  questions: Question[];
  currentIndex: number;
  correctCount: number;
  score: number;
  combo: number;
  maxCombo: number;
  mode: QuizMode;
  currentQuestionMode?: QuizMode;
}

// 回答履歴の型
export interface AnswerHistoryItem {
  question: Question;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  isTimeout: boolean;
}

// 語句の進捗データの型
export interface WordProgress {
  stage: number;
  nextDue: string;
  correct: number;
  wrong: number;
  mode: QuizMode;
}

// 全体の進捗データの型
export interface Progress {
  streak: number;
  lastPlayedDate: string;
  todayCount: number;
  totalCorrect: number;
  words: {
    [questionId: number]: WordProgress;
  };
}

// 画面の型
export type Screen = 'start' | 'quiz' | 'result';
```

### ステップ 3: 定数とユーティリティの作成

#### `src/utils/constants.ts`

```typescript
export const DAILY_THEMES = [
  '📖 ビジネス基礎語',
  '🎯 誤用しやすい言葉',
  '✨ 教養ワード',
  '💼 敬語マスター',
  '🔥 今週の必修語',
];

export const INTERVALS = [1, 2, 4, 7, 14, 30];

export const QUIZ_SIZE = 5;
export const TIMER_DURATION = 20000; // 20秒（ミリ秒）
export const AUTO_NEXT_DELAY = 3000; // 3秒（ミリ秒）
```

#### `src/utils/storage.ts`

localStorageの読み書きを管理するユーティリティ関数を実装：

```typescript
import { Progress, Question } from '@/types';
import { INTERVALS } from './constants';

const STORAGE_KEY = 'vocabQuizProgress';

export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function daysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function loadProgress(questions: Question[]): Progress {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return initializeProgress(questions);
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const progress = JSON.parse(saved);
    updateStreak(progress);
    return progress;
  }

  return initializeProgress(questions);
}

export function saveProgress(progress: Progress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function initializeProgress(questions: Question[]): Progress {
  const progress: Progress = {
    streak: 0,
    lastPlayedDate: getTodayString(),
    todayCount: 0,
    totalCorrect: 0,
    words: {},
  };

  questions.forEach((q) => {
    progress.words[q.id] = {
      stage: 0,
      nextDue: getTodayString(),
      correct: 0,
      wrong: 0,
      mode: 'meaning',
    };
  });

  return progress;
}

function updateStreak(progress: Progress): void {
  const today = getTodayString();
  const diff = daysDiff(progress.lastPlayedDate, today);

  if (diff === 0) {
    return;
  } else if (diff === 1) {
    progress.streak++;
  } else if (diff > 1) {
    progress.streak = 1;
  }

  progress.lastPlayedDate = today;
  progress.todayCount = 0;
}
```

#### `src/utils/quiz.ts`

クイズのロジックを管理する関数：

```typescript
import { Question, QuizMode, Choice, Progress, WordProgress } from '@/types';
import { INTERVALS } from './constants';
import { getTodayString } from './storage';

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function getChoices(question: Question, mode: QuizMode): Choice[] {
  if (mode === 'recall') {
    return shuffleArray([
      { text: question.term, isCorrect: true },
      ...question.recallIncorrect.map((text) => ({ text, isCorrect: false })),
    ]);
  } else {
    return shuffleArray([
      { text: question.correct, isCorrect: true },
      ...question.incorrect.map((text) => ({ text, isCorrect: false })),
    ]);
  }
}

export function updateWordProgress(
  wordProgress: WordProgress,
  isCorrect: boolean,
  quizMode: QuizMode
): void {
  if (isCorrect) {
    wordProgress.correct++;
    wordProgress.stage = Math.min(wordProgress.stage + 1, INTERVALS.length - 1);
  } else {
    wordProgress.wrong++;
    wordProgress.stage = Math.max(wordProgress.stage - 1, 0);
  }

  // 適応型モードの場合、習熟度に応じてモードを切り替え
  if (quizMode === 'mixed') {
    const totalAttempts = wordProgress.correct + wordProgress.wrong;
    const accuracy = totalAttempts > 0 ? wordProgress.correct / totalAttempts : 0;

    if (!wordProgress.mode) {
      wordProgress.mode = 'meaning';
    }

    // ステージ3以上または正答率80%以上で語句想起型に昇格
    if (
      wordProgress.mode === 'meaning' &&
      (wordProgress.stage >= 3 || accuracy >= 0.8) &&
      totalAttempts >= 3
    ) {
      wordProgress.mode = 'recall';
    }

    // 語句想起型で正答率が60%未満に落ちたら意味理解型に戻す
    if (wordProgress.mode === 'recall' && accuracy < 0.6 && totalAttempts >= 3) {
      wordProgress.mode = 'meaning';
    }
  }

  // 次回復習日を計算
  const interval = INTERVALS[wordProgress.stage];
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + interval);
  wordProgress.nextDue = nextDue.toISOString().split('T')[0];
}

export function getDailyTheme(themes: string[]): string {
  const today = new Date();
  const dayIndex = today.getDay();
  return themes[dayIndex % themes.length];
}

export function getDueCount(progress: Progress, questions: Question[]): number {
  const today = getTodayString();
  return questions.filter((q) => progress.words[q.id]?.nextDue <= today).length;
}
```

### ステップ 4: 問題データのJSON化

`src/data/questions.json` を作成し、`app/index.html`の`QUESTIONS`配列をJSON形式に変換：

```json
[
  {
    "id": 1,
    "term": "是非を問う",
    "correct": "物事の正しいか正しくないかを判断する",
    "incorrect": [
      "絶対にやり遂げようと強く求める",
      "全力を尽くして取り組む",
      "相手に熱心に依頼する"
    ],
    "recallIncorrect": ["応酬する", "成就する", "言及する"],
    "explanation": "是か非か＝正しいか正しくないかを判断する意。",
    "example": "例：会議で新方針の是非を問う場面となった",
    "newsArticles": [
      {
        "title": "新潟知事、原発再稼働の是非問う県民投票の課題指摘",
        "url": "https://www.nikkei.com/article/DGXZQOCC022C80S5A400C2000000/",
        "source": "日本経済新聞",
        "date": "2025-04-02"
      }
    ]
  }
  // ... 残りの10問も同様に変換
]
```

**重要**: すべての11問を正確に変換すること。

### ステップ 5: コンポーネントの実装

#### `src/components/Header.tsx`

```typescript
'use client';

import { QuizSession } from '@/types';

interface HeaderProps {
  score: number;
  streak: number;
  combo: number;
  showCombo: boolean;
}

export default function Header({ score, streak, combo, showCombo }: HeaderProps) {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold mb-2">📚 ゴイキャン</h1>
      <div className="flex gap-4 flex-wrap items-center text-sm">
        <div className="flex items-center gap-1">
          🎯 スコア: <span className="text-amber-400 font-bold text-lg">{score}</span>
        </div>
        {showCombo && combo >= 2 && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 rounded-full font-bold shadow-lg animate-pulse">
            🔥 {combo} COMBO!
          </div>
        )}
        <div className="flex items-center gap-1">
          🔥 <strong>{streak}</strong>日
        </div>
      </div>
    </header>
  );
}
```

#### `src/components/Footer.tsx`

```typescript
'use client';

interface FooterProps {
  message: string;
  onReset: () => void;
}

export default function Footer({ message, onReset }: FooterProps) {
  return (
    <footer className="bg-white p-4 text-center border-t border-gray-300 text-sm text-gray-600">
      <div className="mb-3">{message}</div>
      <button
        onClick={onReset}
        className="bg-red-500 text-white px-6 py-2 rounded-md text-sm hover:bg-red-600 transition-all hover:-translate-y-0.5"
      >
        データをリセット
      </button>
    </footer>
  );
}
```

#### `src/components/StartScreen.tsx`

```typescript
'use client';

import { QuizMode } from '@/types';

interface StartScreenProps {
  dailyTheme: string;
  onStartQuiz: (mode: QuizMode) => void;
}

export default function StartScreen({ dailyTheme, onStartQuiz }: StartScreenProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg text-center">
      <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-full mb-4 font-bold shadow-md">
        {dailyTheme}
      </div>
      <h2 className="text-2xl font-bold mb-2 text-slate-800">5問クリアで達成！</h2>
      <p className="text-gray-600 mb-8 leading-relaxed text-sm">
        制限時間20秒、連続正解でボーナス
        <br />
        サクッと2分で完走しよう
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onStartQuiz('mixed')}
          className="flex-1 min-w-[200px] bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-3 rounded-md text-lg font-medium hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-md"
        >
          おまかせ（推奨）
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onStartQuiz('meaning')}
            className="flex-1 min-w-[140px] bg-blue-500 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-600 transition-all hover:-translate-y-0.5"
          >
            意味理解型
          </button>
          <button
            onClick={() => onStartQuiz('recall')}
            className="flex-1 min-w-[140px] bg-purple-600 text-white px-6 py-2 rounded-md text-sm hover:bg-purple-700 transition-all hover:-translate-y-0.5"
          >
            語句想起型
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### `src/components/QuizScreen.tsx`

```typescript
'use client';

import { Question, Choice, QuizMode } from '@/types';
import { useEffect, useState } from 'react';

interface QuizScreenProps {
  question: Question;
  choices: Choice[];
  mode: QuizMode;
  currentMode: QuizMode;
  onAnswer: (selectedIndex: number) => void;
  onTimeout: () => void;
  timerDuration: number;
}

export default function QuizScreen({
  question,
  choices,
  mode,
  currentMode,
  onAnswer,
  onTimeout,
  timerDuration,
}: QuizScreenProps) {
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerWidth, setTimerWidth] = useState(100);

  // タイマーの管理
  useEffect(() => {
    setTimerWidth(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / timerDuration) * 100);
      setTimerWidth(remaining);
    }, 50);

    const timeout = setTimeout(() => {
      if (!answered) {
        onTimeout();
      }
    }, timerDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [question, timerDuration, onTimeout, answered]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < choices.length) {
          handleAnswer(index);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [answered, choices]);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedIndex(index);
    setIsCorrect(choices[index].isCorrect);
    onAnswer(index);
  };

  // 問題文の表示
  const renderQuestionText = () => {
    if (mode === 'mixed' && currentMode === 'recall') {
      return (
        <>
          <div className="text-purple-600 text-base mb-4">🧩 意味から語句を選ぶモードです</div>
          <div>{question.correct}</div>
        </>
      );
    } else if (currentMode === 'recall') {
      return question.correct;
    } else {
      return question.term;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      {/* タイマーバー */}
      <div className="h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all ease-linear"
          style={{ width: `${timerWidth}%`, transitionDuration: '50ms' }}
        />
      </div>

      {/* 問題文 */}
      <div className="text-3xl font-bold text-center mb-6 text-slate-800">
        {renderQuestionText()}
      </div>

      {/* 選択肢 */}
      <div className="flex flex-col gap-3">
        {choices.map((choice, index) => {
          let buttonClass = 'bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white';

          if (answered) {
            if (choice.isCorrect) {
              buttonClass = 'bg-green-600 border-green-600 text-white';
            } else if (index === selectedIndex && !isCorrect) {
              buttonClass = 'bg-red-500 border-red-500 text-white';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              className={`${buttonClass} px-4 py-3 rounded-md text-left transition-all hover:-translate-y-0.5 shadow-md disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
            >
              <span className="inline-block w-6 h-6 bg-gray-200 text-slate-800 rounded-full text-center text-sm font-bold mr-2 leading-6">
                {index + 1}
              </span>
              {choice.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

#### `src/components/ResultScreen.tsx`

```typescript
'use client';

import { AnswerHistoryItem, Question, QuizMode, Progress } from '@/types';
import { useState } from 'react';

interface ResultScreenProps {
  score: number;
  maxCombo: number;
  questions: Question[];
  answerHistory: AnswerHistoryItem[];
  mode: QuizMode;
  progress: Progress;
  onRestart: () => void;
}

export default function ResultScreen({
  score,
  maxCombo,
  questions,
  answerHistory,
  mode,
  progress,
  onRestart,
}: ResultScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const correctCount = answerHistory.filter((item) => item.isCorrect).length;
  const rate = (correctCount / answerHistory.length) * 100;

  let badge = '🎉 挑戦者';
  if (rate === 100) badge = '🏆 パーフェクト！';
  else if (rate >= 80) badge = '🌟 語彙マスター';
  else if (rate >= 60) badge = '✨ 優秀';

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg text-center">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">🎉 クリア！</h2>

      <div className="inline-block bg-gradient-to-r from-pink-400 to-red-500 text-white px-6 py-3 rounded-full mb-6 text-xl font-bold shadow-lg animate-bounce">
        {badge}
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <div className="text-lg mb-3 text-slate-800">
          獲得スコア: <strong className="text-green-600 text-2xl">{score}</strong>pt
        </div>
        <div className="text-lg text-slate-800">
          最大コンボ: <strong className="text-green-600 text-2xl">{maxCombo}</strong>連続
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-blue-500 text-white px-8 py-3 rounded-md text-lg hover:bg-blue-600 transition-all hover:-translate-y-0.5 shadow-md mb-6 w-full"
      >
        🔄 もう一度挑戦
      </button>

      {/* 回答確認トグル */}
      <div
        onClick={() => setShowReview(!showReview)}
        className="cursor-pointer text-gray-500 text-sm py-2 hover:text-slate-700 transition-colors"
      >
        {showReview ? '▲ 回答を閉じる' : '▼ 回答を確認する'}
      </div>

      {/* 回答詳細 */}
      {showReview && (
        <div className="mt-4 p-6 bg-gray-50 rounded-lg text-left max-h-96 overflow-y-auto">
          {answerHistory.map((item, index) => {
            const resultClass = item.isCorrect ? 'border-l-green-600' : 'border-l-red-500';
            const resultText = item.isCorrect ? '✅ 正解' : '❌ 不正解';

            let itemMode = mode;
            if (mode === 'mixed') {
              const wordProgress = progress.words[item.question.id];
              itemMode = wordProgress?.mode || 'meaning';
            }

            const modeIcon =
              mode === 'mixed' ? (
                itemMode === 'recall' ? (
                  <span className="text-purple-600 text-xs">🧩 想起</span>
                ) : (
                  <span className="text-blue-500 text-xs">📖 理解</span>
                )
              ) : null;

            const questionDisplay =
              itemMode === 'recall'
                ? `意味: ${item.question.correct}`
                : `語句: ${item.question.term}`;

            const correctDisplay =
              itemMode === 'recall'
                ? `正解: ${item.question.term}`
                : `正解: ${item.question.correct}`;

            return (
              <div key={index} className={`p-4 mb-3 bg-white rounded-md border-l-4 ${resultClass}`}>
                <div className="font-bold text-base mb-2 text-slate-800">
                  {modeIcon && <>{modeIcon} </>}Q{index + 1}. {questionDisplay}
                  <span
                    className={`ml-2 inline-block px-2 py-1 rounded-xl text-xs font-bold ${
                      item.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {resultText}
                  </span>
                </div>
                {!item.isCorrect && (
                  <div className="text-sm mb-1 text-gray-700">
                    あなたの回答: {item.isTimeout ? '（タイムアップ）' : item.userAnswer}
                  </div>
                )}
                <div className="text-sm mb-2 text-green-700 font-bold">{correctDisplay}</div>
                <div className="text-sm italic text-gray-600">{item.question.example}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ニュース記事セクション */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl mb-4 text-slate-800 text-center">
          📰 今回学んだ語句が使われているニュース
        </h3>
        {questions.map((question) => {
          if (!question.newsArticles || question.newsArticles.length === 0) return null;

          return (
            <div
              key={question.id}
              className="mb-6 p-4 bg-white rounded-md border-l-4 border-l-blue-500"
            >
              <div className="font-bold text-base mb-3 text-slate-800">{question.term}</div>
              {question.newsArticles.map((article, idx) => (
                <div
                  key={idx}
                  className="mb-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm font-medium hover:underline block mb-1"
                  >
                    {article.title}
                  </a>
                  <div className="text-xs text-gray-500">
                    {article.source} | {article.date}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### ステップ 6: メインページの実装

#### `src/app/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StartScreen from '@/components/StartScreen';
import QuizScreen from '@/components/QuizScreen';
import ResultScreen from '@/components/ResultScreen';
import {
  Question,
  QuizMode,
  QuizSession,
  AnswerHistoryItem,
  Progress,
  Choice,
  Screen,
} from '@/types';
import { loadProgress, saveProgress, resetProgress, getTodayString } from '@/utils/storage';
import {
  shuffleArray,
  getChoices,
  updateWordProgress,
  getDailyTheme,
  getDueCount,
} from '@/utils/quiz';
import { DAILY_THEMES, QUIZ_SIZE, TIMER_DURATION, AUTO_NEXT_DELAY } from '@/utils/constants';
import questionsData from '@/data/questions.json';

export default function Home() {
  const [questions] = useState<Question[]>(questionsData);
  const [screen, setScreen] = useState<Screen>('start');
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistoryItem[]>([]);
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [dailyTheme, setDailyTheme] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    example: string;
    combo: number;
    comboBonus: number;
  } | null>(null);
  const [autoNextTimeoutId, setAutoNextTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // 初期化
  useEffect(() => {
    const prog = loadProgress(questions);
    setProgress(prog);
    setDailyTheme(getDailyTheme(DAILY_THEMES));
  }, [questions]);

  // クイズ開始
  const startQuiz = (mode: QuizMode) => {
    const shuffledQuestions = shuffleArray(questions).slice(0, QUIZ_SIZE);
    const session: QuizSession = {
      questions: shuffledQuestions,
      currentIndex: 0,
      correctCount: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      mode,
    };

    setQuizSession(session);
    setAnswerHistory([]);
    setScreen('quiz');
    showNextQuestion(session, mode, 0);
  };

  // 次の問題を表示
  const showNextQuestion = (session: QuizSession, mode: QuizMode, index: number) => {
    if (index >= session.questions.length) {
      setScreen('result');
      return;
    }

    const question = session.questions[index];
    let currentMode = mode;

    if (mode === 'mixed' && progress) {
      const wordProgress = progress.words[question.id];
      if (!wordProgress.mode) {
        wordProgress.mode = 'meaning';
      }
      currentMode = wordProgress.mode;
    }

    const choices = getChoices(question, currentMode);
    setCurrentChoices(choices);
    setQuizSession({ ...session, currentQuestionMode: currentMode });
    setShowFeedback(false);
    setFeedbackData(null);
  };

  // 回答処理
  const handleAnswer = (selectedIndex: number) => {
    if (!quizSession || !progress) return;

    // 自動遷移のタイマーをクリア
    if (autoNextTimeoutId) {
      clearTimeout(autoNextTimeoutId);
    }

    const selectedChoice = currentChoices[selectedIndex];
    const isCorrect = selectedChoice.isCorrect;
    const currentQuestion = quizSession.questions[quizSession.currentIndex];

    // 回答履歴に追加
    const historyItem: AnswerHistoryItem = {
      question: currentQuestion,
      userAnswer: selectedChoice.text,
      correctAnswer: currentQuestion.correct,
      isCorrect,
      isTimeout: false,
    };
    setAnswerHistory([...answerHistory, historyItem]);

    // スコア計算
    let newSession = { ...quizSession };
    if (isCorrect) {
      newSession.correctCount++;
      newSession.combo++;
      newSession.maxCombo = Math.max(newSession.maxCombo, newSession.combo);

      const baseScore = 100;
      const comboBonus = (newSession.combo - 1) * 50;
      newSession.score += baseScore + comboBonus;

      setFeedbackData({
        isCorrect: true,
        example: currentQuestion.example,
        combo: newSession.combo,
        comboBonus,
      });
    } else {
      newSession.combo = 0;
      setFeedbackData({
        isCorrect: false,
        example: currentQuestion.example,
        combo: 0,
        comboBonus: 0,
      });
    }

    setQuizSession(newSession);
    setShowFeedback(true);

    // 進捗を更新
    const newProgress = { ...progress };
    updateWordProgress(newProgress.words[currentQuestion.id], isCorrect, quizSession.mode);
    newProgress.totalCorrect += isCorrect ? 1 : 0;
    newProgress.todayCount++;
    setProgress(newProgress);
    saveProgress(newProgress);

    // 次の問題へ自動遷移
    const timeoutId = setTimeout(() => {
      newSession.currentIndex++;
      setQuizSession(newSession);
      showNextQuestion(newSession, quizSession.mode, newSession.currentIndex);
    }, AUTO_NEXT_DELAY);

    setAutoNextTimeoutId(timeoutId);
  };

  // タイムアウト処理
  const handleTimeout = () => {
    if (!quizSession || !progress) return;

    const currentQuestion = quizSession.questions[quizSession.currentIndex];

    // 回答履歴に追加
    const historyItem: AnswerHistoryItem = {
      question: currentQuestion,
      userAnswer: null,
      correctAnswer: currentQuestion.correct,
      isCorrect: false,
      isTimeout: true,
    };
    setAnswerHistory([...answerHistory, historyItem]);

    // コンボをリセット
    const newSession = { ...quizSession, combo: 0 };
    setQuizSession(newSession);
    setShowFeedback(true);
    setFeedbackData({
      isCorrect: false,
      example: currentQuestion.example,
      combo: 0,
      comboBonus: 0,
    });

    // 進捗を更新
    const newProgress = { ...progress };
    updateWordProgress(newProgress.words[currentQuestion.id], false, quizSession.mode);
    newProgress.todayCount++;
    setProgress(newProgress);
    saveProgress(newProgress);

    // 次の問題へ自動遷移
    const timeoutId = setTimeout(() => {
      newSession.currentIndex++;
      setQuizSession(newSession);
      showNextQuestion(newSession, quizSession.mode, newSession.currentIndex);
    }, AUTO_NEXT_DELAY);

    setAutoNextTimeoutId(timeoutId);
  };

  // 手動で次へ進む
  const proceedToNext = () => {
    if (!quizSession) return;

    if (autoNextTimeoutId) {
      clearTimeout(autoNextTimeoutId);
    }

    const newSession = { ...quizSession };
    newSession.currentIndex++;
    setQuizSession(newSession);
    showNextQuestion(newSession, quizSession.mode, newSession.currentIndex);
  };

  // リスタート
  const restartQuiz = () => {
    setScreen('start');
  };

  // データリセット
  const handleReset = () => {
    if (confirm('すべてのデータ（スコア、連続日数、進捗）がリセットされます。\nよろしいですか？')) {
      resetProgress();
      window.location.reload();
    }
  };

  // フッターメッセージ
  const getFooterMessage = () => {
    if (!progress) return '復習準備中...';

    if (screen === 'quiz' && quizSession) {
      const current = quizSession.currentIndex + 1;
      const total = quizSession.questions.length;
      return `📝 進捗: ${current} / ${total}問目`;
    }

    const dueCount = getDueCount(progress, questions);
    if (dueCount > 0) {
      return `📝 今日の復習: ${dueCount}問`;
    }
    return '🎉 今日の復習は完了です！';
  };

  if (!progress) {
    return <div className="min-h-screen bg-gray-100">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        score={quizSession?.score || 0}
        streak={progress.streak}
        combo={quizSession?.combo || 0}
        showCombo={screen === 'quiz'}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto p-6">
        {screen === 'start' && <StartScreen dailyTheme={dailyTheme} onStartQuiz={startQuiz} />}

        {screen === 'quiz' && quizSession && (
          <>
            <QuizScreen
              question={quizSession.questions[quizSession.currentIndex]}
              choices={currentChoices}
              mode={quizSession.mode}
              currentMode={quizSession.currentQuestionMode || quizSession.mode}
              onAnswer={handleAnswer}
              onTimeout={handleTimeout}
              timerDuration={TIMER_DURATION}
            />

            {/* フィードバック表示 */}
            {showFeedback && feedbackData && (
              <div
                className={`mt-4 p-4 rounded-lg animate-slideIn ${
                  feedbackData.isCorrect
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-600 text-green-900'
                    : 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-500 text-red-900'
                }`}
              >
                <div className="font-bold text-2xl mb-2 animate-bounce">
                  {feedbackData.isCorrect ? '✅ 正解！' : '❌ 惜しい！'}
                </div>
                {feedbackData.isCorrect && feedbackData.combo >= 2 && (
                  <div className="text-amber-600 font-bold my-2">
                    🔥 {feedbackData.combo}連続！ +{feedbackData.comboBonus}pt
                  </div>
                )}
                <div className="my-3 p-3 bg-white bg-opacity-50 rounded italic text-sm leading-relaxed">
                  {feedbackData.example}
                </div>
                <button
                  onClick={proceedToNext}
                  className="bg-green-600 text-white px-8 py-2 rounded-md w-full hover:bg-green-700 transition-all mt-2"
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}

        {screen === 'result' && quizSession && (
          <ResultScreen
            score={quizSession.score}
            maxCombo={quizSession.maxCombo}
            questions={quizSession.questions}
            answerHistory={answerHistory}
            mode={quizSession.mode}
            progress={progress}
            onRestart={restartQuiz}
          />
        )}
      </main>

      <Footer message={getFooterMessage()} onReset={handleReset} />
    </div>
  );
}
```

#### `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ゴイキャン - 語彙力トレーニング',
  description: 'TikTok的な中毒性を持つ短時間語彙学習アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

#### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
}
```

### ステップ 7: 設定ファイルの調整

#### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ステップ 8: 実装の確認とテスト

1. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

2. **動作確認項目**
   - [ ] スタート画面が正しく表示される
   - [ ] 3つのモード（おまかせ、意味理解型、語句想起型）が選択できる
   - [ ] クイズが正常に動作する
   - [ ] タイマーが正しくカウントダウンする
   - [ ] 20秒経過でタイムアップになる
   - [ ] 選択肢をクリック/キーボード（1-4）で回答できる
   - [ ] 正解・不正解のフィードバックが表示される
   - [ ] スコアとコンボが正しく計算される
   - [ ] 「次へ」ボタンで手動遷移できる
   - [ ] 3秒後に自動で次の問題に進む
   - [ ] 5問終了後に結果画面が表示される
   - [ ] 回答確認トグルが動作する
   - [ ] ニュース記事が表示される
   - [ ] 「もう一度挑戦」でスタート画面に戻る
   - [ ] localStorageに進捗が保存される
   - [ ] データリセットが動作する
   - [ ] 適応型モード（おまかせ）で習熟度に応じてモードが切り替わる
   - [ ] 連続日数が正しくカウントされる

3. **レスポンシブデザインの確認**
   - モバイル表示でも正しく動作することを確認

### ステップ 9: ビルドとデプロイ

1. **本番ビルド**
   ```bash
   npm run build
   ```

2. **静的エクスポート（オプション）**

   もし静的サイトとしてエクスポートしたい場合は、`next.config.js`に以下を追加：
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
   };

   module.exports = nextConfig;
   ```

   その後：
   ```bash
   npm run build
   ```

   `out`ディレクトリに静的ファイルが生成されます。

## 注意事項

1. **すべての機能を完全に移植すること**
   - タイマー機能
   - スコアリング・コンボシステム
   - 間隔反復（SR）システム
   - 適応型難易度調整
   - ニュース記事表示
   - 繰り返し学習機能

2. **型安全性を維持**
   - すべての関数とコンポーネントに適切な型定義を付与
   - `any`型の使用を避ける

3. **アクセシビリティ**
   - キーボード操作のサポート
   - 適切なaria属性の使用

4. **パフォーマンス**
   - 不要な再レンダリングを避ける
   - useCallbackやuseMemoを適切に使用

5. **既存の仕様を完全に守る**
   - `specification.md`の全機能を実装
   - UIの見た目や動作を既存アプリと同等に保つ

## 完了チェックリスト

- [ ] プロジェクトのセットアップ完了
- [ ] 型定義の作成完了
- [ ] ユーティリティ関数の実装完了
- [ ] questions.jsonの作成完了（全11問）
- [ ] 全コンポーネントの実装完了
- [ ] メインページの実装完了
- [ ] 開発サーバーでの動作確認完了
- [ ] 全機能のテスト完了
- [ ] レスポンシブデザインの確認完了
- [ ] 本番ビルドの成功確認
- [ ] 既存アプリとの機能比較完了

## トラブルシューティング

### localStorageのエラー

Next.jsのSSRとlocalStorageの衝突を避けるため、`typeof window !== 'undefined'`チェックを忘れずに。

### タイマーがうまく動作しない

useEffectの依存配列を適切に設定し、クリーンアップ関数で必ずタイマーをクリアすること。

### 型エラー

questions.jsonをインポートする際、TypeScriptの設定で`resolveJsonModule: true`が必要。

## 追加の改善案（オプション）

実装完了後、以下の改善を検討してもよい：

1. **状態管理の改善**: useReducerやZustandの導入
2. **アニメーション**: Framer Motionの導入
3. **PWA化**: next-pwaの導入でオフライン対応
4. **テスト**: JestとReact Testing Libraryでのテスト追加
5. **問題データのAPI化**: 将来的にバックエンドから取得する準備
