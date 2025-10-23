import { useState } from 'react';

export function ResultScreen({ quizSession, answerHistory, progress, onRestart }) {
  const [showReview, setShowReview] = useState(false);

  const getBadge = () => {
    const rate = (quizSession.correctCount / quizSession.questions.length) * 100;
    if (rate === 100) return '🏆 パーフェクト！';
    if (rate >= 80) return '🌟 語彙マスター';
    if (rate >= 60) return '✨ 優秀';
    return '🎉 挑戦者';
  };

  const toggleReview = () => {
    setShowReview(!showReview);
  };

  const renderReviewDetails = () => {
    return answerHistory.map((item, index) => {
      const resultClass = item.isCorrect ? 'correct' : 'incorrect';
      const resultText = item.isCorrect ? '✅ 正解' : '❌ 不正解';
      const userAnswerText = item.isTimeout
        ? '（タイムアップ）'
        : `あなたの回答: ${item.userAnswer}`;

      let questionDisplay, correctDisplay, modeIcon;
      let itemMode = quizSession.mode;

      if (quizSession.mode === 'mixed') {
        const wordProgress = progress.words[item.question.id];
        itemMode = wordProgress && wordProgress.mode ? wordProgress.mode : 'meaning';
      }

      if (itemMode === 'recall') {
        questionDisplay = `意味: ${item.question.correct}`;
        correctDisplay = `正解: ${item.question.term}`;
        modeIcon =
          quizSession.mode === 'mixed'
            ? '<span style="color: #9b59b6; font-size: 0.85rem;">🧩 想起</span> '
            : '';
      } else {
        questionDisplay = `語句: ${item.question.term}`;
        correctDisplay = `正解: ${item.question.correct}`;
        modeIcon =
          quizSession.mode === 'mixed'
            ? '<span style="color: #3498db; font-size: 0.85rem;">📖 理解</span> '
            : '';
      }

      return (
        <div key={index} className={`review-item ${resultClass}`}>
          <div className="review-term">
            <span dangerouslySetInnerHTML={{ __html: modeIcon }} />
            Q{index + 1}. {questionDisplay}
            <span className={`review-result ${resultClass}`}>{resultText}</span>
          </div>
          {!item.isCorrect && (
            <div className="review-answer">{userAnswerText}</div>
          )}
          <div className="review-answer" style={{ color: '#27ae60', fontWeight: 'bold' }}>
            {correctDisplay}
          </div>
          <div className="review-answer" style={{ fontStyle: 'italic', color: '#666' }}>
            {item.question.example}
          </div>
        </div>
      );
    });
  };

  const renderNewsArticles = () => {
    return quizSession.questions.map((question, qIndex) => {
      if (!question.newsArticles || question.newsArticles.length === 0) {
        return null;
      }

      return (
        <div key={qIndex} className="news-term-group">
          <div className="news-term-title">{question.term}</div>
          {question.newsArticles.map((article, aIndex) => (
            <div key={aIndex} className="news-article">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-article-title"
              >
                {article.title}
              </a>
              <div className="news-article-meta">
                {article.source} | {article.date}
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="card">
      <div className="result-screen">
        <h2>🎉 クリア！</h2>
        <div className="result-badge">{getBadge()}</div>
        <div className="result-stats">
          <div className="result-stat">
            獲得スコア: <strong>{quizSession.score}</strong>pt
          </div>
          <div className="result-stat">
            最大コンボ: <strong>{quizSession.maxCombo}</strong>連続
          </div>
        </div>
        <button
          className="start-btn"
          onClick={onRestart}
          style={{ margin: '1.5rem 0' }}
        >
          🔄 もう一度挑戦
        </button>
        <div
          className="review-toggle"
          onClick={toggleReview}
        >
          <span>
            {showReview ? '▲ 回答を閉じる' : '▼ 回答を確認する'}
          </span>
        </div>
        {showReview && (
          <div className="review-details">{renderReviewDetails()}</div>
        )}
        <div className="news-section">
          <h3
            style={{
              fontSize: '1.2rem',
              margin: '2rem 0 1rem',
              color: '#2c3e50',
              textAlign: 'center',
            }}
          >
            📰 今回学んだ語句が使われているニュース
          </h3>
          <div>{renderNewsArticles()}</div>
        </div>
      </div>
    </div>
  );
}
