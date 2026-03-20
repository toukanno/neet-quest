import { useGameStore } from "@/store/gameStore";

export function HUD() {
  const player = useGameStore((s) => s.player);
  const gold = useGameStore((s) => s.gold);
  const socialPoints = useGameStore((s) => s.socialPoints);

  return (
    <div className="hud">
      <div className="hud__left">
        <span className="hud__name">
          {player.name} Lv.{player.level}
        </span>
        <div className="hud__bars">
          <div className="hud__bar-row">
            <span className="hud__bar-label" style={{ color: "var(--hp-bar)" }}>
              HP
            </span>
            <div className="bar bar--hp" style={{ flex: 1 }}>
              <div
                className="bar__fill"
                style={{
                  width: `${(player.hp / player.maxHp) * 100}%`,
                }}
              />
            </div>
            <span className="hud__bar-value">
              {player.hp}/{player.maxHp}
            </span>
          </div>
          <div className="hud__bar-row">
            <span className="hud__bar-label" style={{ color: "var(--mp-bar)" }}>
              MP
            </span>
            <div className="bar bar--mp" style={{ flex: 1 }}>
              <div
                className="bar__fill"
                style={{
                  width: `${(player.mp / player.maxMp) * 100}%`,
                }}
              />
            </div>
            <span className="hud__bar-value">
              {player.mp}/{player.maxMp}
            </span>
          </div>
        </div>
      </div>
      <div className="hud__right">
        <span style={{ color: "var(--gold)" }}>{gold}G</span>
        <span style={{ color: "var(--social-bar)" }}>&#x2764; {socialPoints}</span>
      </div>

      <style>{`
        .hud {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.8rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--bg-tertiary);
          font-size: 0.8rem;
        }
        .hud__left {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .hud__name {
          color: var(--accent);
          font-weight: 700;
          white-space: nowrap;
        }
        .hud__bars {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 140px;
        }
        .hud__bar-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .hud__bar-label {
          font-size: 0.65rem;
          width: 18px;
          font-weight: 700;
        }
        .hud__bar-value {
          font-size: 0.65rem;
          color: var(--text-muted);
          min-width: 50px;
          text-align: right;
        }
        .hud__right {
          display: flex;
          gap: 0.8rem;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
