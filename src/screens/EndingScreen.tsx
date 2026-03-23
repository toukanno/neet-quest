import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function EndingScreen() {
  const navigate = useNavigate();
  const currentEnding = useGameStore((s) => s.currentEnding);
  const dismissEnding = useGameStore((s) => s.dismissEnding);
  const [visibleCount, setVisibleCount] = useState(1);

  if (!currentEnding) {
    navigate("/");
    return null;
  }

  const { title, description, epilogue } = currentEnding;
  const allRevealed = visibleCount >= epilogue.length;

  const handleAdvance = () => {
    if (!allRevealed) {
      setVisibleCount((c) => c + 1);
    }
  };

  const handleReturn = () => {
    dismissEnding();
    navigate("/");
  };

  return (
    <div className="ending-screen" onClick={handleAdvance}>
      <div className="ending-screen__inner">
        <h1 className="ending-screen__title">{title}</h1>

        <div className="ending-screen__epilogue">
          {epilogue.slice(0, visibleCount).map((paragraph, i) => (
            <p key={i} className="ending-screen__paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {!allRevealed && (
          <p className="ending-screen__hint">
            -- Click to continue --
          </p>
        )}

        {allRevealed && (
          <div className="ending-screen__finale">
            <p className="ending-screen__description">{description}</p>
            <button
              className="btn btn--primary ending-screen__btn"
              onClick={(e) => {
                e.stopPropagation();
                handleReturn();
              }}
            >
              タイトルに戻る
            </button>
          </div>
        )}
      </div>

      <style>{`
        .ending-screen {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0a0a1a 0%, #0f172a 100%);
          cursor: pointer;
          padding: 2rem 1rem;
        }
        .ending-screen__inner {
          max-width: 640px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }
        .ending-screen__title {
          font-size: 2rem;
          color: var(--accent);
          text-align: center;
          letter-spacing: 0.12em;
          text-shadow: 0 0 24px rgba(56, 189, 248, 0.3);
          margin: 0;
        }
        .ending-screen__epilogue {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
          width: 100%;
        }
        .ending-screen__paragraph {
          color: var(--text-primary);
          font-size: 1.1rem;
          line-height: 1.85;
          text-align: center;
          margin: 0;
          animation: ending-fade-in 0.8s ease-out both;
        }
        @keyframes ending-fade-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ending-screen__hint {
          color: var(--text-muted);
          font-size: 0.85rem;
          text-align: center;
          animation: ending-blink 2s ease-in-out infinite;
          margin: 0;
        }
        @keyframes ending-blink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .ending-screen__finale {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: ending-fade-in 1s ease-out both;
        }
        .ending-screen__description {
          color: var(--text-secondary, #94a3b8);
          font-size: 1rem;
          text-align: center;
          line-height: 1.7;
          font-style: italic;
          margin: 0;
        }
        .ending-screen__btn {
          padding: 0.8rem 2.5rem;
          font-size: 1.1rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
