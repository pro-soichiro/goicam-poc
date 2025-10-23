import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="landing-page">
      <div className="hero">
        <h1>📚 ゴイキャン<br />語彙力トレーニング</h1>
        <p>
          1日5問、サクッと2分。<br />
          ニュース記事とつながる、実践的な語彙学習
        </p>
        <Link to="/app" className="cta-button">今すぐ始める →</Link>
      </div>

      <div className="container">
        <div className="section">
          <h2>✨ 特徴</h2>
          <div className="features">
            <div className="feature">
              <h3>🎯 クイズでサクッと学ぶ</h3>
              <p>
                4択クイズに答えるだけ。<br />
                1セッション5問、2分以内で完了。<br />
                スキマ時間で語彙力を強化できます。
              </p>
            </div>
            <div className="feature">
              <h3>📰 ニュース記事と連携</h3>
              <p>
                学んだ語句が実際に使われているニュース記事を表示。<br />
                実用的な文脈で語句を理解し、記憶の定着率UP。<br />
                「あ、さっき見た単語だ！」を体験。
              </p>
            </div>
            <div className="feature">
              <h3>🔥 コンボでモチベーションUP</h3>
              <p>
                連続正解でボーナススコア。<br />
                ゲーム感覚で楽しく続けられます。<br />
                連続日数も記録されます。
              </p>
            </div>
            <div className="feature">
              <h3>🧠 忘れにくい復習システム</h3>
              <p>
                間隔反復学習で記憶定着。<br />
                語句ごとに最適なタイミングで復習。<br />
                自然に語彙が身につきます。
              </p>
            </div>
            <div className="feature">
              <h3>📈 適応型難易度</h3>
              <p>
                習熟度に応じて出題形式が変化。<br />
                最初は意味理解型、慣れたら語句想起型へ。<br />
                自分の成長を実感できます。
              </p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>🚀 使い方の流れ</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>アプリを開く</h3>
                <p>ブラウザで開くだけ。インストール不要。</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>クイズ形式を選ぶ</h3>
                <p>「おまかせ（推奨）」「意味理解型」「語句想起型」から選択。</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>5問に挑戦</h3>
                <p>制限時間20秒で4択クイズに回答。即座にフィードバック。</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>結果とニュース記事を確認</h3>
                <p>
                  スコアとコンボを確認。学んだ語句が使われているニュース記事リンクも表示されます。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>👥 こんな人におすすめ</h2>
          <div className="target-users">
            <div className="target-user">もっとカッコよく話したい</div>
            <div className="target-user">表現の幅を広げたい</div>
            <div className="target-user">スキマ時間で学びたい</div>
            <div className="target-user">語彙力をつけたい</div>
          </div>
        </div>

        <div className="section" style={{ textAlign: 'center' }}>
          <h2>💰 利用料金</h2>
          <p style={{ fontSize: '1.3rem', color: '#667eea', fontWeight: 'bold' }}>
            完全無料
          </p>
          <p style={{ color: '#666', marginTop: '1rem' }}>
            すべての機能を無料でご利用いただけます。<br />
            登録不要、ブラウザですぐに始められます。
          </p>
        </div>

        <div className="section" style={{ textAlign: 'center' }}>
          <Link to="/app" className="cta-button">今すぐ始める →</Link>
        </div>
      </div>

      <footer className="lp-footer">
        <p>📚 ゴイキャン - 語彙力トレーニング</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
          © 2025 ゴイキャン POC プロジェクト
        </p>
      </footer>
    </div>
  );
}
