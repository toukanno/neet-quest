import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { QUESTS } from "@/data/quests";

export function QuestScreen() {
  const navigate = useNavigate();
  const activeQuests = useGameStore((s) => s.activeQuests);
  const completedQuests = useGameStore((s) => s.completedQuests);

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">クエスト</h2>
        <button className="btn btn--small" onClick={() => navigate("/game")}>
          もどる
        </button>
      </div>

      <h3 style={{ color: "var(--warning)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
        進行中のクエスト
      </h3>
      {activeQuests.length === 0 ? (
        <div className="panel" style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          進行中のクエストはありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {activeQuests.map((questId) => {
            const quest = QUESTS[questId];
            if (!quest) return null;
            return (
              <div key={questId} className="panel">
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: 4,
                      background: quest.type === "main" ? "var(--danger)" : "var(--accent)",
                      color: "white",
                    }}
                  >
                    {quest.type === "main" ? "メイン" : "サブ"}
                  </span>
                  <span style={{ fontSize: "0.95rem" }}>{quest.title}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {quest.description}
                </p>
                <div style={{ fontSize: "0.8rem" }}>
                  {quest.objectives.map((obj) => (
                    <div
                      key={obj.id}
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        alignItems: "center",
                        color: obj.completed ? "var(--success)" : "var(--text-primary)",
                      }}
                    >
                      <span>{obj.completed ? "\u2705" : "\u2B1C"}</span>
                      <span>
                        {obj.description}
                        {obj.targetCount > 1 &&
                          ` (${obj.currentCount}/${obj.targetCount})`}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: "0.4rem" }}>
                  報酬: {quest.rewards.exp}EXP / {quest.rewards.gold}G / 社会復帰+{quest.rewards.socialPoints}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ color: "var(--success)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
        完了したクエスト ({completedQuests.length})
      </h3>
      {completedQuests.length === 0 ? (
        <div className="panel" style={{ color: "var(--text-muted)" }}>
          まだクエストを完了していません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {completedQuests.map((questId) => {
            const quest = QUESTS[questId];
            if (!quest) return null;
            return (
              <div
                key={questId}
                className="panel"
                style={{ opacity: 0.6, padding: "0.5rem 1rem" }}
              >
                <span style={{ fontSize: "0.85rem" }}>
                  \u2705 {quest.title}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
