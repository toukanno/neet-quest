import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementsScreen() {
  const navigate = useNavigate();
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const gameStarted = useGameStore((s) => s.gameStarted);

  const allAchievements = Object.values(ACHIEVEMENTS);

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">実績</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {unlockedAchievements.length} / {allAchievements.length}
          </span>
          <button
            className="btn btn--small"
            onClick={() => navigate(gameStarted ? "/game" : "/")}
          >
            もどる
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {allAchievements.map((ach) => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <div
              key={ach.id}
              className="panel"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                opacity: unlocked ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: unlocked ? "var(--accent)" : "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                }}
              >
                {unlocked ? ach.icon : "\u{2753}"}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: unlocked ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {unlocked ? ach.name : "???"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {unlocked ? ach.description : "条件を満たすと解放されます"}
                </div>
              </div>
              {unlocked && (
                <div style={{ marginLeft: "auto", color: "var(--success)", fontSize: "1.1rem" }}>
                  {"\u2705"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
