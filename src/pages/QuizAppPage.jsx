import { useState, useEffect, useCallback, useMemo } from 'react';
import { StartScreen } from '../components/StartScreen';
import { QuizScreen } from '../components/QuizScreen';
import { ResultScreen } from '../components/ResultScreen';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../data/questions';
import { getTodayString, daysDiff } from '../utils/dateUtils';
import {
  STREAK_BREAK_THRESHOLD_DAYS,
  COMBO_THRESHOLD,
  SCORE
} from '../constants/quizConfig';

export function QuizAppPage() {
  const [screen, setScreen] = useState('start');
  const [feedback, setFeedback] = useState(null);

  const getInitialProgress = () => {
    const initial = {
      streak: 0,
      lastPlayedDate: getTodayString(),
      todayCount: 0,
      totalCorrect: 0,
      words: {},
    };

    QUESTIONS.forEach((q) => {
      initial.words[q.id] = {
        stage: 0,
        nextDue: getTodayString(),
        correct: 0,
        wrong: 0,
        mode: 'meaning',
      };
    });

    return initial;
  };

  const [progress, setProgress] = useLocalStorage(
    'vocabQuizProgress',
    getInitialProgress()
  );

  const quiz = useQuiz(progress, setProgress);

  useEffect(() => {
    const today = getTodayString();
    const diff = daysDiff(progress.lastPlayedDate, today);

    if (diff === STREAK_BREAK_THRESHOLD_DAYS) {
      setProgress({ ...progress, streak: progress.streak + 1, lastPlayedDate: today, todayCount: 0 });
    } else if (diff > STREAK_BREAK_THRESHOLD_DAYS) {
      setProgress({ ...progress, streak: 1, lastPlayedDate: today, todayCount: 0 });
    }
  }, []);

  const handleStart = useCallback((mode) => {
    const session = quiz.startQuiz(mode);
    setScreen('quiz');
    setFeedback(null);
    setTimeout(() => {
      quiz.setupQuestion(session);
    }, 0);
  }, [quiz]);

  const handleAnswer = useCallback((selectedIndex) => {
    if (quiz.answered) return;

    quiz.checkAnswer(selectedIndex, ({ isCorrect, newSession }) => {
      let combo = null;
      let bonusPoints = null;

      if (isCorrect && newSession.combo >= COMBO_THRESHOLD) {
        combo = newSession.combo;
        bonusPoints = (newSession.combo - 1) * SCORE.COMBO_BONUS_PER_STREAK;
      }

      setFeedback({
        isCorrect,
        isTimeout: false,
        selectedIndex,
        combo,
        bonusPoints,
      });
    });
  }, [quiz]);

  const handleTimeout = useCallback(() => {
    if (quiz.answered) return;

    quiz.handleTimeout(() => {
      setFeedback({
        isCorrect: false,
        isTimeout: true,
        selectedIndex: null,
        combo: null,
        bonusPoints: null,
      });
    });
  }, [quiz]);

  const handleNext = useCallback(() => {
    setFeedback(null);

    if (quiz.quizSession.currentIndex >= quiz.quizSession.questions.length) {
      setScreen('result');
    } else {
      quiz.setupQuestion(quiz.quizSession);
    }
  }, [quiz]);

  const handleRestart = useCallback(() => {
    setScreen('start');
    setFeedback(null);
  }, []);

  const resetAllData = () => {
    if (
      window.confirm(
        'すべてのデータ（スコア、連続日数、進捗）がリセットされます。\nよろしいですか？'
      )
    ) {
      setProgress(getInitialProgress());
      alert('データをリセットしました。');
      window.location.reload();
    }
  };

  const dueCount = useMemo(() => {
    const today = getTodayString();
    return QUESTIONS.filter((q) => {
      return progress.words[q.id] && progress.words[q.id].nextDue <= today;
    }).length;
  }, [progress]);

  const footerText = useMemo(() => {
    if (screen === 'quiz' && quiz.quizSession) {
      const current = quiz.quizSession.currentIndex + 1;
      const total = quiz.quizSession.questions.length;
      return `📝 進捗: ${current} / ${total}問目`;
    }

    if (dueCount > 0) {
      return `📝 今日の復習: ${dueCount}問`;
    }
    return '🎉 今日の復習は完了です！';
  }, [screen, quiz.quizSession, dueCount]);

  return (
    <>
      <header>
        <h1>📚 ゴイキャン</h1>
        <div className="stats">
          <div className="stat-item">
            🎯 スコア: <span className="score-display">{quiz.quizSession?.score || 0}</span>
          </div>
          {quiz.quizSession && quiz.quizSession.combo >= 2 && (
            <div className="stat-item combo">
              🔥 <span>{quiz.quizSession.combo}</span> COMBO!
            </div>
          )}
          <div className="stat-item">
            🔥 <strong>{progress.streak}</strong>日
          </div>
        </div>
      </header>

      <main>
        {screen === 'start' && <StartScreen onStart={handleStart} />}

        {screen === 'quiz' && quiz.currentQuestion && (
          <QuizScreen
            question={quiz.currentQuestion}
            choices={quiz.currentChoices}
            mode={quiz.quizSession?.currentQuestionMode || quiz.quizSession?.mode}
            quizMode={quiz.quizSession?.mode}
            answered={quiz.answered}
            feedback={feedback}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onTimeout={handleTimeout}
          />
        )}

        {screen === 'result' && quiz.quizSession && (
          <ResultScreen
            quizSession={quiz.quizSession}
            answerHistory={quiz.answerHistory}
            progress={progress}
            onRestart={handleRestart}
          />
        )}
      </main>

      <footer>
        {footerText}
        <div style={{ marginTop: '1rem' }}>
          <button className="reset-btn" onClick={resetAllData}>
            データをリセット
          </button>
        </div>
      </footer>
    </>
  );
}
