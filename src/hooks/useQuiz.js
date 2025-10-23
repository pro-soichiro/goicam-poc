import { useState } from 'react';
import { QUESTIONS } from '../data/questions';
import { getTodayString } from '../utils/dateUtils';
import {
  QUESTIONS_PER_QUIZ,
  SCORE,
  STAGES,
  MODES,
  INTERVALS,
} from '../constants/quizConfig';

// Helper function: Generate shuffled choices for a question
const generateChoices = (question, mode) => {
  if (mode === 'recall') {
    return [
      { text: question.term, isCorrect: true },
      ...question.recallIncorrect.map((text) => ({ text, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);
  } else {
    return [
      { text: question.correct, isCorrect: true },
      ...question.incorrect.map((text) => ({ text, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);
  }
};

// Helper function: Determine question mode for mixed mode
const determineQuestionMode = (sessionMode, questionId, progress) => {
  if (sessionMode !== 'mixed') {
    return sessionMode;
  }

  const wordProgress = progress.words[questionId];
  return wordProgress?.mode || MODES.MEANING;
};

export function useQuiz(progress, setProgress) {
  const [quizSession, setQuizSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);

  const startQuiz = (mode = MODES.MEANING) => {
    const shuffledQuestions = [...QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, QUESTIONS_PER_QUIZ);

    const session = {
      questions: shuffledQuestions,
      currentIndex: 0,
      correctCount: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      mode: mode,
    };

    setQuizSession(session);
    setAnswerHistory([]);
    return session;
  };

  const setupQuestion = (session) => {
    if (!session || session.currentIndex >= session.questions.length) {
      return null;
    }

    const question = session.questions[session.currentIndex];
    setCurrentQuestion(question);
    setAnswered(false);

    // Determine question mode
    const currentMode = determineQuestionMode(session.mode, question.id, progress);

    // Generate choices
    const choices = generateChoices(question, currentMode);
    setCurrentChoices(choices);

    // Update session with current question mode
    const updatedSession = { ...session, currentQuestionMode: currentMode };
    setQuizSession(updatedSession);

    return { question, choices, mode: currentMode };
  };

  const checkAnswer = (selectedIndex, onComplete) => {
    if (answered) return;
    setAnswered(true);

    const selectedChoice = currentChoices[selectedIndex];
    const isCorrect = selectedChoice.isCorrect;

    // 回答履歴に記録
    const newHistory = [
      ...answerHistory,
      {
        question: currentQuestion,
        userAnswer: selectedChoice.text,
        correctAnswer: currentQuestion.correct,
        isCorrect,
        isTimeout: false,
      },
    ];
    setAnswerHistory(newHistory);

    // スコア計算
    const newSession = { ...quizSession };
    if (isCorrect) {
      newSession.correctCount++;
      newSession.combo++;
      newSession.maxCombo = Math.max(newSession.maxCombo, newSession.combo);

      const baseScore = SCORE.BASE;
      const comboBonus = (newSession.combo - 1) * SCORE.COMBO_BONUS_PER_STREAK;
      newSession.score += baseScore + comboBonus;
    } else {
      newSession.combo = 0;
    }

    newSession.currentIndex++;
    setQuizSession(newSession);

    // プログレス更新
    updateProgress(isCorrect, currentQuestion, newSession.mode);

    if (onComplete) {
      onComplete({ isCorrect, newSession, newHistory });
    }

    return { isCorrect, newSession, newHistory };
  };

  const handleTimeout = (onComplete) => {
    if (answered) return;
    setAnswered(true);

    const newHistory = [
      ...answerHistory,
      {
        question: currentQuestion,
        userAnswer: null,
        isCorrect: false,
        isTimeout: true,
      },
    ];
    setAnswerHistory(newHistory);

    const newSession = { ...quizSession, combo: 0, currentIndex: quizSession.currentIndex + 1 };
    setQuizSession(newSession);

    updateProgress(false, currentQuestion, newSession.mode);

    if (onComplete) {
      onComplete({ isCorrect: false, newSession, newHistory });
    }

    return { isCorrect: false, newSession, newHistory };
  };

  const updateProgress = (isCorrect, question, mode) => {
    const newProgress = { ...progress };
    const wordProgress = newProgress.words[question.id];

    if (!wordProgress) {
      newProgress.words[question.id] = {
        stage: STAGES.MIN,
        nextDue: getTodayString(),
        correct: 0,
        wrong: 0,
        mode: MODES.MEANING,
      };
    }

    const wp = newProgress.words[question.id];

    if (isCorrect) {
      wp.correct++;
      newProgress.totalCorrect++;
      newProgress.todayCount++;
      wp.stage = Math.min(wp.stage + 1, STAGES.MAX);
    } else {
      wp.wrong++;
      newProgress.todayCount++;
      wp.stage = Math.max(wp.stage - 1, STAGES.MIN);
    }

    // 習熟度に応じてモードを自動切り替え（混合モードの場合のみ）
    if (mode === 'mixed') {
      const totalAttempts = wp.correct + wp.wrong;
      const accuracy = totalAttempts > 0 ? wp.correct / totalAttempts : 0;

      if (!wp.mode) {
        wp.mode = MODES.MEANING;
      }

      // ステージ3以上 または 正答率80%以上で語句想起型に昇格
      if (
        wp.mode === MODES.MEANING &&
        (wp.stage >= 3 || accuracy >= 0.8) &&
        totalAttempts >= 3
      ) {
        wp.mode = MODES.WORD;
      }

      // 語句想起型で正答率が60%未満に落ちたら意味理解型に戻す
      if (wp.mode === MODES.WORD && accuracy < 0.6 && totalAttempts >= 3) {
        wp.mode = MODES.MEANING;
      }
    }

    // 次回復習日を計算
    const interval = INTERVALS[wp.stage];
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + interval);
    wp.nextDue = nextDue.toISOString().split('T')[0];

    setProgress(newProgress);
  };

  return {
    quizSession,
    currentQuestion,
    currentChoices,
    answered,
    answerHistory,
    startQuiz,
    setupQuestion,
    checkAnswer,
    handleTimeout,
    setAnswerHistory,
  };
}
