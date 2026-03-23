import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function GameOverScreen() {
  const navigate = useNavigate();
  const loadGame = useGameStore((s) => s.loadGame);

  const handleLoadLastSave = () => {
    const saves = useGameStore.getState().getSaveSlots();
    let latestSlot: string | null = null;
    let latestTimestamp = 0;
    saves.forEach((save, i) => {
      if (save && save.timestamp > latestTimestamp) {
        latestTimestamp = save.timestamp;
        latestSlot = String(i + 1);
      }
    });
    if (latestSlot) {
      loadGame(latestSlot);
      navigate("/game");
    } else {
      navigate("/");
    }
  };

  const handleReturnToTitle = () => {
    navigate("/");
  };

  return (
    <div className="gameover-screen">
      <div className="gameover-screen__inner">
        <h1 className="gameover-screen__title">ゲームオーバー</h1>
        <p className="gameover-screen__message">
          諦めるのはまだ早い。もう一度立ち上がろう。
        </p>
        <div className="gameover-screen__buttons">
          <button
            className="btn btn--primary gameover-screen__btn"
            onClick={handleLoadLastSave}
          >
            最後のセーブから再開
          </button>
          <button
            className="btn gameover-screen__btn gameover-screen__btn--secondary"
            onClick={handleReturnToTitle}
          >
            タイトルに戻る
          </button>
        </div>
      </div>

      <style>{`
        .gameover-screen {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0a0000 0%, #1a0a0a 50%, #0a0a0a 100%);
          padding: 2rem 1rem;
          animation: gameover-bg-fade 1.2s ease-out both;
        }
        @keyframes gameover-bg-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .gameover-screen__inner {
          max-width: 480px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: gameover-content-rise 1.5s ease-out 0.4s both;
        }
        @keyframes gameover-content-rise {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gameover-screen__title {
          font-size: 2.8rem;
          color: var(--danger);
          text-align: center;
          letter-spacing: 0.18em;
          text-shadow: 0 0 32px rgba(239, 68, 68, 0.5), 0 0 64px rgba(239, 68, 68, 0.2);
          margin: 0;
        }
        .gameover-screen__message {
          color: var(--text-secondary, #94a3b8);
          font-size: 1.1rem;
          text-align: center;
          line-height: 1.8;
          margin: 0;
        }
        .gameover-screen__buttons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          width: 100%;
        }
        .gameover-screen__btn {
          padding: 0.8rem 2.5rem;
          font-size: 1.1rem;
          cursor: pointer;
          width: 100%;
          max-width: 320px;
        }
        .gameover-screen__btn--secondary {
          background: transparent;
          border: 1px solid var(--text-muted, #475569);
          color: var(--text-muted, #94a3b8);
        }
        .gameover-screen__btn--secondary:hover {
          border-color: var(--text-secondary, #94a3b8);
          color: var(--text-primary, #e2e8f0);
        }
      `}</style>
    </div>
  );
}
