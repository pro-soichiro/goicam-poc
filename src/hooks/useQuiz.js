import { useState, useEffect } from 'react';
import { QUESTIONS, INTERVALS } from '../data/questions';

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const daysDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

export function useQuiz(progress, setProgress) {
  const [quizSession, setQuizSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);

  const startQuiz = (mode = 'meaning') => {
    const shuffledQuestions = [...QUESTIONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

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

    // 問題モードの決定
    let currentMode = session.mode;
    if (session.mode === 'mixed' && progress.words[question.id]) {
      const wordProgress = progress.words[question.id];
      currentMode = wordProgress.mode || 'meaning';
    }

    // 選択肢の生成
    let choices;
    if (currentMode === 'recall') {
      choices = [
        { text: question.term, isCorrect: true },
        ...question.recallIncorrect.map((text) => ({ text, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
    } else {
      choices = [
        { text: question.correct, isCorrect: true },
        ...question.incorrect.map((text) => ({ text, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
    }

    setCurrentChoices(choices);

    // セッションにcurrentQuestionModeを保存
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

      const baseScore = 100;
      const comboBonus = (newSession.combo - 1) * 50;
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
        stage: 0,
        nextDue: getTodayString(),
        correct: 0,
        wrong: 0,
        mode: 'meaning',
      };
    }

    const wp = newProgress.words[question.id];

    if (isCorrect) {
      wp.correct++;
      newProgress.totalCorrect++;
      newProgress.todayCount++;
      wp.stage = Math.min(wp.stage + 1, INTERVALS.length - 1);
    } else {
      wp.wrong++;
      newProgress.todayCount++;
      wp.stage = Math.max(wp.stage - 1, 0);
    }

    // 習熟度に応じてモードを自動切り替え（混合モードの場合のみ）
    if (mode === 'mixed') {
      const totalAttempts = wp.correct + wp.wrong;
      const accuracy = totalAttempts > 0 ? wp.correct / totalAttempts : 0;

      if (!wp.mode) {
        wp.mode = 'meaning';
      }

      // ステージ3以上 または 正答率80%以上で語句想起型に昇格
      if (
        wp.mode === 'meaning' &&
        (wp.stage >= 3 || accuracy >= 0.8) &&
        totalAttempts >= 3
      ) {
        wp.mode = 'recall';
      }

      // 語句想起型で正答率が60%未満に落ちたら意味理解型に戻す
      if (wp.mode === 'recall' && accuracy < 0.6 && totalAttempts >= 3) {
        wp.mode = 'meaning';
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
