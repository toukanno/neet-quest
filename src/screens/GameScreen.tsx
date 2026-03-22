import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { MapView } from "@/components/MapView";
import { DialogueBox } from "@/components/DialogueBox";
import { HUD } from "@/components/HUD";
import { MAPS } from "@/data/maps";
import { SHOPS } from "@/data/shops";

export function GameScreen() {
  const navigate = useNavigate();
  const gameStarted = useGameStore((s) => s.gameStarted);
  const movePlayer = useGameStore((s) => s.movePlayer);
  const interact = useGameStore((s) => s.interact);
  const currentDialogue = useGameStore((s) => s.currentDialogue);
  const currentMapId = useGameStore((s) => s.currentMapId);
  const openShop = useGameStore((s) => s.openShop);
  const day = useGameStore((s) => s.day);

  const hasShop = currentMapId in SHOPS;

  useEffect(() => {
    if (!gameStarted) {
      navigate("/");
    }
  }, [gameStarted, navigate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentDialogue) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault();
          movePlayer("up");
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          movePlayer("down");
          break;
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          movePlayer("left");
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          movePlayer("right");
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          interact();
          break;
        case "i":
          navigate("/inventory");
          break;
        case "q":
          navigate("/quests");
          break;
        case "c":
          navigate("/status");
          break;
      }
    },
    [movePlayer, interact, currentDialogue, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const map = MAPS[currentMapId];

  return (
    <div className="game-screen">
      <HUD />

      <div className="game-screen__main">
        <div className="game-screen__map-area">
          <div className="game-screen__map-name">
            {map?.name ?? ""}
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
              {day}日目
            </span>
          </div>
          <MapView />
          {hasShop && (
            <button
              className="btn btn--small"
              style={{ marginTop: "0.5rem" }}
              onClick={() => {
                openShop(currentMapId);
                navigate("/shop");
              }}
            >
              ショップ
            </button>
          )}
        </div>

        <div className="game-screen__controls">
          <div className="dpad">
            <button className="dpad__btn dpad__up" onClick={() => movePlayer("up")}>&#9650;</button>
            <button className="dpad__btn dpad__left" onClick={() => movePlayer("left")}>&#9664;</button>
            <button className="dpad__btn dpad__action" onClick={interact}>&#9673;</button>
            <button className="dpad__btn dpad__right" onClick={() => movePlayer("right")}>&#9654;</button>
            <button className="dpad__btn dpad__down" onClick={() => movePlayer("down")}>&#9660;</button>
          </div>
        </div>
      </div>

      {currentDialogue && <DialogueBox />}

      <div className="game-screen__nav">
        <button className="btn btn--small" onClick={() => navigate("/status")}>
          ステータス [C]
        </button>
        <button className="btn btn--small" onClick={() => navigate("/inventory")}>
          持ち物 [I]
        </button>
        <button className="btn btn--small" onClick={() => navigate("/quests")}>
          クエスト [Q]
        </button>
        <button className="btn btn--small" onClick={() => navigate("/save")}>
          セーブ
        </button>
        <button className="btn btn--small" onClick={() => navigate("/achievements")}>
          実績
        </button>
        <button className="btn btn--small" onClick={() => navigate("/settings")}>
          設定
        </button>
      </div>

      <style>{`
        .game-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          gap: 0.5rem;
        }
        .game-screen__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        .game-screen__map-area {
          text-align: center;
        }
        .game-screen__map-name {
          color: var(--accent);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .game-screen__controls {
          display: flex;
          justify-content: center;
        }
        .dpad {
          display: grid;
          grid-template-areas:
            ". up ."
            "left action right"
            ". down .";
          gap: 4px;
        }
        .dpad__btn {
          width: 44px;
          height: 44px;
          background: var(--bg-tertiary);
          border: 1px solid var(--text-muted);
          color: var(--text-primary);
          font-size: 1.1rem;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dpad__btn:active {
          background: var(--accent);
          color: var(--bg-primary);
        }
        .dpad__up { grid-area: up; }
        .dpad__down { grid-area: down; }
        .dpad__left { grid-area: left; }
        .dpad__right { grid-area: right; }
        .dpad__action { grid-area: action; background: var(--accent); color: var(--bg-primary); }
        .game-screen__nav {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}
