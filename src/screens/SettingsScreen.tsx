import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

export function SettingsScreen() {
  const navigate = useNavigate();
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const gameStarted = useGameStore((s) => s.gameStarted);

  return (
    <div className="screen">
      <div className="screen__header">
        <h2 className="screen__title">設定</h2>
        <button
          className="btn btn--small"
          onClick={() => navigate(gameStarted ? "/game" : "/")}
        >
          もどる
        </button>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.8rem" }}>音量</h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
            <span>BGM</span>
            <span>{settings.bgmVolume}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.bgmVolume}
            onChange={(e) => updateSettings({ bgmVolume: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>

        <div>
          <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
            <span>効果音</span>
            <span>{settings.seVolume}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.seVolume}
            onChange={(e) => updateSettings({ seVolume: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.8rem" }}>テキスト速度</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["slow", "normal", "fast"] as const).map((speed) => (
            <button
              key={speed}
              className={`btn btn--small ${settings.textSpeed === speed ? "btn--primary" : ""}`}
              onClick={() => updateSettings({ textSpeed: speed })}
            >
              {speed === "slow" ? "おそい" : speed === "normal" ? "ふつう" : "はやい"}
            </button>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <h3 style={{ color: "var(--accent)", marginBottom: "0.8rem" }}>その他</h3>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.showTutorial}
            onChange={(e) => updateSettings({ showTutorial: e.target.checked })}
            style={{ accentColor: "var(--accent)" }}
          />
          チュートリアルを表示する
        </label>
      </div>

      <div className="panel">
        <h3 style={{ color: "var(--accent)", marginBottom: "0.8rem" }}>操作方法</h3>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 2 }}>
          <div>WASD / 矢印キー: 移動</div>
          <div>Space / Enter: 話しかける / 調べる</div>
          <div>C: ステータス画面</div>
          <div>I: もちもの画面</div>
          <div>Q: クエスト画面</div>
        </div>
      </div>
    </div>
  );
}
