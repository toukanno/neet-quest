import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function SaveLoadScreen() {
  const navigate = useNavigate();
  const saveGame = useGameStore((s) => s.saveGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const getSaveSlots = useGameStore((s) => s.getSaveSlots);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const slots = getSaveSlots();

  const handleSave = (slotId: string) => {
    saveGame(slotId);
    // Force re-render
    navigate("/save");
  };

  const handleLoad = (slotId: string) => {
    if (loadGame(slotId)) {
      navigate("/game");
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">セーブ / ロード</h2>
        <button
          className="btn btn--small"
          onClick={() => navigate(gameStarted ? "/game" : "/")}
        >
          もどる
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {[1, 2, 3].map((slotNum) => {
          const save = slots[slotNum - 1];
          return (
            <div key={slotNum} className="panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "var(--accent)" }}>
                  スロット {slotNum}
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {gameStarted && (
                    <button
                      className="btn btn--small btn--primary"
                      onClick={() => handleSave(String(slotNum))}
                    >
                      セーブ
                    </button>
                  )}
                  {save && (
                    <button
                      className="btn btn--small"
                      onClick={() => handleLoad(String(slotNum))}
                    >
                      ロード
                    </button>
                  )}
                </div>
              </div>
              {save ? (
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <div>
                    {save.player.name} Lv.{save.player.level} — 第{save.chapter}章
                  </div>
                  <div>社会復帰度: {save.socialPoints}pt</div>
                  <div style={{ color: "var(--text-muted)" }}>
                    {formatDate(save.timestamp)}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  — 空き —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
