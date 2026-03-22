import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function TitleScreen() {
  const navigate = useNavigate();
  const initNewGame = useGameStore((s) => s.initNewGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const getSaveSlots = useGameStore((s) => s.getSaveSlots);

  const handleNewGame = () => {
    initNewGame();
    navigate("/game");
  };

  const handleContinue = () => {
    const slots = getSaveSlots();
    const latestSave = slots
      .filter(Boolean)
      .sort((a, b) => b!.timestamp - a!.timestamp)[0];
    if (latestSave) {
      loadGame(latestSave.id);
      navigate("/game");
    }
  };

  const hasSaves = getSaveSlots().some(Boolean);

  return (
    <div className="title-screen">
      <div className="title-screen__bg" />
      <div className="title-screen__content">
        <div className="title-screen__logo">
          <span className="title-screen__icon">&#x1F5E1;</span>
          <h1 className="title-screen__title">ニートクエスト</h1>
          <p className="title-screen__subtitle">
            ニートが勇者として社会復帰するRPG
          </p>
        </div>

        <div className="title-screen__menu">
          <button className="btn btn--primary title-btn" onClick={handleNewGame}>
            はじめから
          </button>
          {hasSaves && (
            <button className="btn title-btn" onClick={handleContinue}>
              つづきから
            </button>
          )}
          <button
            className="btn title-btn"
            onClick={() => navigate("/save")}
          >
            セーブデータ
          </button>
          <button
            className="btn title-btn"
            onClick={() => navigate("/achievements")}
          >
            実績
          </button>
          <button
            className="btn title-btn"
            onClick={() => navigate("/settings")}
          >
            設定
          </button>
        </div>

        <p className="title-screen__footer">
          &#x1F6A7; Version 0.1.0 — 開発中
        </p>
      </div>

      <style>{`
        .title-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .title-screen__bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, #1a1a3e 0%, #0f172a 70%);
          z-index: 0;
        }
        .title-screen__content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }
        .title-screen__logo {
          text-align: center;
        }
        .title-screen__icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 0.5rem;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .title-screen__title {
          font-size: 3rem;
          color: var(--accent);
          text-shadow: 0 0 30px rgba(56, 189, 248, 0.3);
          letter-spacing: 0.15em;
        }
        .title-screen__subtitle {
          color: var(--text-secondary);
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }
        .title-screen__menu {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          min-width: 220px;
        }
        .title-btn {
          width: 100%;
          padding: 0.8rem 2rem;
          font-size: 1.1rem;
        }
        .title-screen__footer {
          color: var(--text-muted);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
