import { useState, useEffect } from 'react';
import { StartScreen } from '../components/StartScreen';
import { QuizScreen } from '../components/QuizScreen';
import { ResultScreen } from '../components/ResultScreen';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../data/questions';

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

const daysDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

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

    if (diff === 1) {
      setProgress({ ...progress, streak: progress.streak + 1, lastPlayedDate: today, todayCount: 0 });
    } else if (diff > 1) {
      setProgress({ ...progress, streak: 1, lastPlayedDate: today, todayCount: 0 });
    }
  }, []);

  const handleStart = (mode) => {
    const session = quiz.startQuiz(mode);
    setScreen('quiz');
    setFeedback(null);
    setTimeout(() => {
      quiz.setupQuestion(session);
    }, 0);
  };

  const handleAnswer = (selectedIndex) => {
    if (quiz.answered) return;

    quiz.checkAnswer(selectedIndex, ({ isCorrect, newSession }) => {
      let comboText = '';
      if (isCorrect && newSession.combo >= 2) {
        const bonus = (newSession.combo - 1) * 50;
        comboText = `<div style="color: #f39c12; font-weight: bold; margin-top: 0.5rem;">🔥 ${newSession.combo}連続！ +${bonus}pt</div>`;
      }

      setFeedback({
        isCorrect,
        isTimeout: false,
        selectedIndex,
        comboText,
      });
    });
  };

  const handleTimeout = () => {
    if (quiz.answered) return;

    quiz.handleTimeout(() => {
      setFeedback({
        isCorrect: false,
        isTimeout: true,
        selectedIndex: null,
        comboText: '',
      });
    });
  };

  const handleNext = () => {
    setFeedback(null);

    if (quiz.quizSession.currentIndex >= quiz.quizSession.questions.length) {
      setScreen('result');
    } else {
      quiz.setupQuestion(quiz.quizSession);
    }
  };

  const handleRestart = () => {
    setScreen('start');
    setFeedback(null);
  };

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

  const getDueCount = () => {
    const today = getTodayString();
    return QUESTIONS.filter((q) => {
      return progress.words[q.id] && progress.words[q.id].nextDue <= today;
    }).length;
  };

  const getFooterText = () => {
    if (screen === 'quiz' && quiz.quizSession) {
      const current = quiz.quizSession.currentIndex + 1;
      const total = quiz.quizSession.questions.length;
      return `📝 進捗: ${current} / ${total}問目`;
    }

    const dueCount = getDueCount();
    if (dueCount > 0) {
      return `📝 今日の復習: ${dueCount}問`;
    }
    return '🎉 今日の復習は完了です！';
  };

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
        {getFooterText()}
        <div style={{ marginTop: '1rem' }}>
          <button className="reset-btn" onClick={resetAllData}>
            データをリセット
          </button>
        </div>
      </footer>
    </>
  );
}
