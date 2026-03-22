import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { AchievementCondition } from "@/types/game";

function getConditionHint(condition: AchievementCondition): string {
  switch (condition.type) {
    case "level":
      return `レベル${condition.value}に到達`;
    case "social_points":
      return `社会復帰度${condition.value}達成`;
    case "gold":
      return `所持金${condition.value}G達成`;
    case "quests_completed":
      return `クエストを${condition.value}個完了`;
    case "enemies_defeated":
      return `敵を${condition.value}体撃破`;
    case "maps_visited":
      return `マップを${condition.value}箇所訪問`;
    case "items_collected":
      return `アイテムを${condition.value}種類収集`;
    default:
      return "条件を満たすと解放されます";
  }
}

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
                opacity: unlocked ? 1 : 0.5,
                transition: "opacity 0.2s ease",
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
                  flexShrink: 0,
                }}
              >
                {unlocked ? ach.icon : "\u{1F512}"}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: unlocked
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    fontWeight: unlocked ? 700 : 400,
                  }}
                >
                  {unlocked ? ach.name : "???"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {unlocked
                    ? ach.description
                    : getConditionHint(ach.condition)}
                </div>
              </div>
              {unlocked && (
                <div
                  style={{
                    marginLeft: "auto",
                    color: "var(--success)",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
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
