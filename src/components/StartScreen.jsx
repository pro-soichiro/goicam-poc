import { DAILY_THEMES } from '../data/questions';

export function StartScreen({ onStart }) {
  const getDailyTheme = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    return DAILY_THEMES[dayIndex % DAILY_THEMES.length];
  };

  return (
    <div className="card">
      <div className="start-screen">
        <div className="daily-theme">{getDailyTheme()}</div>
        <h2>5問クリアで達成！</h2>
        <p>
          制限時間20秒、連続正解でボーナス
          <br />
          サクッと2分で完走しよう
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            className="start-btn"
            onClick={() => onStart('mixed')}
            style={{
              flex: 1,
              minWidth: '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            onMouseOver={(e) => (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => (e.target.style.opacity = '1')}
          >
            おまかせ（推奨）
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.8rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            className="start-btn"
            onClick={() => onStart('meaning')}
            style={{
              flex: 1,
              minWidth: '140px',
              fontSize: '0.9rem',
              padding: '0.7rem 1.5rem',
            }}
          >
            意味理解型
          </button>
          <button
            className="start-btn"
            onClick={() => onStart('recall')}
            style={{
              flex: 1,
              minWidth: '140px',
              fontSize: '0.9rem',
              padding: '0.7rem 1.5rem',
              background: '#9b59b6',
            }}
            onMouseOver={(e) => (e.target.style.background = '#8e44ad')}
            onMouseOut={(e) => (e.target.style.background = '#9b59b6')}
          >
            語句想起型
          </button>
        </div>
      </div>
    </div>
  );
}
