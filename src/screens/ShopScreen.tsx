import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { ITEMS } from "@/data/items";
import { SHOPS } from "@/data/shops";

type Tab = "buy" | "sell";

export function ShopScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("buy");
  const [message, setMessage] = useState<string | null>(null);

  const currentMapId = useGameStore((s) => s.currentMapId);
  const gold = useGameStore((s) => s.gold);
  const inventory = useGameStore((s) => s.inventory);
  const buyItem = useGameStore((s) => s.buyItem);
  const sellItem = useGameStore((s) => s.sellItem);

  const shop = SHOPS[currentMapId];

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 1500);
  };

  const handleBuy = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (gold < item.price) {
      showMessage("ゴールドが足りない！");
      return;
    }
    const shopItem = shop?.inventory.find((si) => si.itemId === itemId);
    if (shopItem && shopItem.stock === 0) {
      showMessage("在庫切れです！");
      return;
    }
    buyItem(itemId);
    showMessage(`${item.name}を購入した！`);
  };

  const handleSell = (itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (item.type === "key") {
      showMessage("大事なものは売れない！");
      return;
    }
    sellItem(itemId);
    const sellPrice = Math.floor(item.price / 2);
    showMessage(`${item.name}を${sellPrice}Gで売却した！`);
  };

  if (!shop) {
    return (
      <div className="screen">
        <div className="screen__header">
          <h2 className="screen__title">ショップ</h2>
          <button className="btn btn--small" onClick={() => navigate("/game")}>
            もどる
          </button>
        </div>
        <div className="panel" style={{ textAlign: "center", color: "var(--text-muted)" }}>
          このエリアにショップはありません
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">{shop.name}</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ color: "var(--gold)", fontSize: "0.9rem" }}>
            {gold}G
          </span>
          <button className="btn btn--small" onClick={() => navigate("/game")}>
            もどる
          </button>
        </div>
      </div>

      {/* Shop greeting */}
      <div
        className="panel"
        style={{
          marginBottom: "0.8rem",
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          borderLeft: "3px solid var(--accent)",
        }}
      >
        「{shop.greeting}」
      </div>

      {/* Message toast */}
      {message && (
        <div
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--accent)",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            marginBottom: "0.8rem",
            fontSize: "0.85rem",
            textAlign: "center",
            color: "var(--accent)",
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem" }}>
        <button
          className={`btn btn--small${tab === "buy" ? " btn--primary" : ""}`}
          onClick={() => setTab("buy")}
        >
          買う
        </button>
        <button
          className={`btn btn--small${tab === "sell" ? " btn--primary" : ""}`}
          onClick={() => setTab("sell")}
        >
          売る
        </button>
      </div>

      {/* Buy tab */}
      {tab === "buy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {shop.inventory.map((si) => {
            const item = ITEMS[si.itemId];
            if (!item) return null;
            const outOfStock = si.stock === 0;
            const cantAfford = gold < item.price;
            return (
              <div
                key={si.itemId}
                className="panel"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  opacity: outOfStock ? 0.4 : 1,
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
                    {si.stock >= 0 && (
                      <span style={{ color: "var(--text-muted)", marginLeft: "0.4rem" }}>
                        残{si.stock}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {item.description}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: cantAfford ? "var(--danger)" : "var(--gold)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {item.price}G
                  </div>
                  <button
                    className="btn btn--small"
                    disabled={outOfStock || cantAfford}
                    onClick={() => handleBuy(si.itemId)}
                  >
                    買う
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sell tab */}
      {tab === "sell" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {inventory.length === 0 ? (
            <div className="panel" style={{ textAlign: "center", color: "var(--text-muted)" }}>
              売れるものがありません
            </div>
          ) : (
            inventory.map((inv) => {
              const item = ITEMS[inv.itemId];
              if (!item) return null;
              const isKey = item.type === "key";
              const sellPrice = Math.floor(item.price / 2);
              return (
                <div
                  key={inv.itemId}
                  className="panel"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    opacity: isKey ? 0.4 : 1,
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
                          {" "}x{inv.count}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {item.description}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: isKey ? "var(--text-muted)" : "var(--success)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {isKey ? "--" : `${sellPrice}G`}
                    </div>
                    <button
                      className="btn btn--small"
                      disabled={isKey}
                      onClick={() => handleSell(inv.itemId)}
                    >
                      売る
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
