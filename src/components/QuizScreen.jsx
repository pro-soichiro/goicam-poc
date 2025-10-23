import { useState, useEffect, useRef } from 'react';

export function QuizScreen({
  question,
  choices,
  mode,
  quizMode,
  answered,
  feedback,
  onAnswer,
  onNext,
  onTimeout,
}) {
  const [timeLeft, setTimeLeft] = useState(100);
  const timerRef = useRef(null);

  useEffect(() => {
    // タイマーをリセット
    setTimeLeft(100);

    // 既存のタイマーをクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 20秒後にタイムアウト
    timerRef.current = setTimeout(() => {
      if (!answered) {
        onTimeout();
      }
    }, 20000);

    // タイマーバーのアニメーション
    const startTime = Date.now();
    const duration = 20000;

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeft(remaining);

      if (remaining > 0 && !answered) {
        requestAnimationFrame(updateTimer);
      }
    };

    requestAnimationFrame(updateTimer);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [question, answered, onTimeout]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!answered && ['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < choices.length) {
          onAnswer(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answered, choices, onAnswer]);

  const getTermDisplay = () => {
    if (quizMode === 'mixed' && mode === 'recall') {
      return (
        <>
          <div style={{ color: '#9b59b6', fontSize: '1rem', marginBottom: '1rem' }}>
            🧩 意味から語句を選ぶモードです
          </div>
          {question.correct}
        </>
      );
    } else if (quizMode === 'mixed' && mode === 'meaning') {
      return question.term;
    } else if (mode === 'recall') {
      return question.correct;
    } else {
      return question.term;
    }
  };

  return (
    <div className="card">
      <div className="timer-bar">
        <div
          className="timer-progress"
          style={{ width: `${timeLeft}%`, transition: 'none' }}
        ></div>
      </div>
      <div className="term">{getTermDisplay()}</div>
      <div className="choices">
        {choices.map((choice, index) => {
          const isCorrect = choice.isCorrect;
          const isSelected = feedback && feedback.selectedIndex === index;
          let className = 'choice-btn';

          if (answered) {
            if (isCorrect) {
              className += ' correct';
            } else if (isSelected && !isCorrect) {
              className += ' incorrect';
            }
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => onAnswer(index)}
              disabled={answered}
              data-index={index}
            >
              <span className="choice-num">{index + 1}</span>
              {choice.text}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div className={`feedback show ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-title">
            {feedback.isTimeout ? '⏰ タイムアップ！' : feedback.isCorrect ? '✅ 正解！' : '❌ 惜しい！'}
          </div>
          {feedback.comboText && (
            <div
              dangerouslySetInnerHTML={{ __html: feedback.comboText }}
            />
          )}
          <div className="example">{question.example}</div>
          <button className="next-btn" onClick={onNext}>
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
