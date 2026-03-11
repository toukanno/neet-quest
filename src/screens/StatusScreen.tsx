import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function StatusScreen() {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const socialPoints = useGameStore((s) => s.socialPoints);
  const gold = useGameStore((s) => s.gold);
  const chapter = useGameStore((s) => s.chapter);

  const socialLevel =
    socialPoints < 20
      ? "ひきこもり"
      : socialPoints < 50
        ? "散歩できるニート"
        : socialPoints < 100
          ? "バイト戦士"
          : socialPoints < 200
            ? "就活生"
            : "社会人";

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">ステータス</h2>
        <button className="btn btn--small" onClick={() => navigate("/game")}>
          もどる
        </button>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.8rem" }}>
          {player.name} — Lv.{player.level}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>HP</span>
            <div className="bar bar--hp" style={{ margin: "4px 0" }}>
              <div className="bar__fill" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
            <span style={{ fontSize: "0.8rem" }}>{player.hp} / {player.maxHp}</span>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>MP</span>
            <div className="bar bar--mp" style={{ margin: "4px 0" }}>
              <div className="bar__fill" style={{ width: `${(player.mp / player.maxMp) * 100}%` }} />
            </div>
            <span style={{ fontSize: "0.8rem" }}>{player.mp} / {player.maxMp}</span>
          </div>
        </div>

        <div style={{ marginTop: "0.8rem" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>EXP</span>
          <div className="bar bar--exp" style={{ margin: "4px 0" }}>
            <div className="bar__fill" style={{ width: `${(player.exp / player.expToNext) * 100}%` }} />
          </div>
          <span style={{ fontSize: "0.8rem" }}>{player.exp} / {player.expToNext}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
          <div className="panel" style={{ textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>こうげき</div>
            <div style={{ fontSize: "1.2rem", color: "var(--danger)" }}>{player.attack}</div>
          </div>
          <div className="panel" style={{ textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>ぼうぎょ</div>
            <div style={{ fontSize: "1.2rem", color: "var(--accent)" }}>{player.defense}</div>
          </div>
          <div className="panel" style={{ textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>すばやさ</div>
            <div style={{ fontSize: "1.2rem", color: "var(--success)" }}>{player.speed}</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>社会復帰度</h3>
        <div className="bar bar--social" style={{ margin: "4px 0", height: "12px" }}>
          <div className="bar__fill" style={{ width: `${Math.min(100, (socialPoints / 200) * 100)}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
          <span>{socialPoints} pt</span>
          <span style={{ color: "var(--success)" }}>{socialLevel}</span>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>そうび</h3>
        <div style={{ fontSize: "0.85rem", lineHeight: 2 }}>
          <div>ぶき: {player.equipment.weapon?.name ?? "なし"}</div>
          <div>よろい: {player.equipment.armor?.name ?? "なし"}</div>
          <div>アクセ: {player.equipment.accessory?.name ?? "なし"}</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
          <span>所持金: {gold}G</span>
          <span>第{chapter}章</span>
        </div>
      </div>
    </div>
  );
}
