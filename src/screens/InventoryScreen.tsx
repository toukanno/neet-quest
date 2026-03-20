import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { ITEMS } from "@/data/items";

export function InventoryScreen() {
  const navigate = useNavigate();
  const inventory = useGameStore((s) => s.inventory);
  const useItem = useGameStore((s) => s.useItem);
  const equipItem = useGameStore((s) => s.equipItem);
  const gold = useGameStore((s) => s.gold);

  const handleUse = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.type === "consumable") {
      useItem(itemId);
    } else if (item.type === "equipment") {
      equipItem(itemId);
    }
  };

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">もちもの</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>
            {gold}G
          </span>
          <button className="btn btn--small" onClick={() => navigate("/game")}>
            もどる
          </button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", color: "var(--text-muted)" }}>
          もちものがありません
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {inventory.map((inv) => {
            const item = ITEMS[inv.itemId];
            if (!item) return null;
            return (
              <div
                key={inv.itemId}
                className="panel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: "var(--bg-tertiary)",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  {item.type === "consumable"
                    ? "\u{1F372}"
                    : item.type === "equipment"
                      ? item.equipSlot === "weapon"
                        ? "\u{2694}"
                        : item.equipSlot === "armor"
                          ? "\u{1F6E1}"
                          : "\u{1F48D}"
                      : "\u{1F511}"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem" }}>
                    {item.name}
                    {inv.count > 1 && (
                      <span style={{ color: "var(--text-muted)" }}>
                        {" "}
                        x{inv.count}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.description}
                  </div>
                </div>
                {item.type !== "key" && (
                  <button
                    className="btn btn--small"
                    onClick={() => handleUse(inv.itemId)}
                  >
                    {item.type === "consumable" ? "つかう" : "そうび"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
