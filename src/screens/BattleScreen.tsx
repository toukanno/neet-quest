import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { ITEMS } from "@/data/items";

const ENEMY_SPRITES: Record<string, string> = {
  slime: "\u{1F7E2}",
  bat: "\u{1F987}",
  goblin: "\u{1F47A}",
  skeleton: "\u{1F480}",
  wolf: "\u{1F43A}",
  golem: "\u{1F916}",
  boss: "\u{1F47F}",
  boss_shadow: "\u{1F300}",
  boss_mirror: "\u{1FA9E}",
  boss_flashback: "\u{1F4F8}",
  boss_door: "\u{1F6AA}",
};

type MenuState = "main" | "skill" | "item" | "target";

export function BattleScreen() {
  const battle = useGameStore((s) => s.battle)!;
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const playerAttack = useGameStore((s) => s.playerAttack);
  const playerSkill = useGameStore((s) => s.playerSkill);
  const playerUseItem = useGameStore((s) => s.playerUseItem);
  const playerFlee = useGameStore((s) => s.playerFlee);
  const endBattle = useGameStore((s) => s.endBattle);

  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuState>("main");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const isPlayerTurn =
    battle.phase === "start" || battle.phase === "player_turn";
  const isBattleOver =
    battle.phase === "victory" || battle.phase === "defeat";

  const handleAttack = (targetIndex: number) => {
    playerAttack(targetIndex);
    setMenu("main");
  };

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkill(skillId);
    setMenu("target");
  };

  const handleSkillTarget = (targetIndex: number) => {
    if (selectedSkill) {
      playerSkill(selectedSkill, targetIndex);
      setMenu("main");
      setSelectedSkill(null);
    }
  };

  const handleItemUse = (itemId: string) => {
    playerUseItem(itemId);
    setMenu("main");
  };

  const consumables = inventory.filter((inv) => {
    const item = ITEMS[inv.itemId];
    return item?.type === "consumable";
  });

  return (
    <div className="battle">
      <div className="battle__enemies">
        {battle.enemies.map((enemy, i) => (
          <div
            key={enemy.id}
            className={`enemy-card ${enemy.hp <= 0 ? "enemy-card--dead" : ""}`}
            onClick={() => {
              if (!isPlayerTurn || enemy.hp <= 0) return;
              if (menu === "target" && selectedSkill) {
                handleSkillTarget(i);
              } else if (menu === "main") {
                handleAttack(i);
              }
            }}
          >
            <div className="enemy-card__sprite">
              {ENEMY_SPRITES[enemy.sprite] ?? "\u{2753}"}
            </div>
            <div className="enemy-card__name">{enemy.name}</div>
            <div className="bar bar--hp" style={{ marginTop: 4 }}>
              <div
                className="bar__fill"
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {enemy.hp}/{enemy.maxHp}
            </div>
          </div>
        ))}
      </div>

      <div className="battle__log" id="battleLog">
        {battle.log.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <div className="battle__player-status">
        <div style={{ flex: 1 }}>
          <div>
            {player.name} Lv.{player.level}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--hp-bar)" }}>
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
            <span style={{ fontSize: "0.75rem" }}>
              {player.hp}/{player.maxHp}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--mp-bar)" }}>
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
            <span style={{ fontSize: "0.75rem" }}>
              {player.mp}/{player.maxMp}
            </span>
          </div>
        </div>
      </div>

      {isBattleOver ? (
        <div className="battle__actions">
          <button
            className="btn btn--primary"
            style={{ gridColumn: "1 / -1" }}
            onClick={() => {
              endBattle();
              if (battle.phase === "defeat") {
                navigate("/");
              }
            }}
          >
            {battle.phase === "victory" ? "フィールドに戻る" : "タイトルに戻る"}
          </button>
        </div>
      ) : isPlayerTurn ? (
        <div className="battle__actions">
          {menu === "main" && (
            <>
              <button className="btn" onClick={() => setMenu("main")}>
                こうげき
              </button>
              <button className="btn" onClick={() => setMenu("skill")}>
                スキル
              </button>
              <button className="btn" onClick={() => setMenu("item")}>
                アイテム
              </button>
              <button className="btn" onClick={playerFlee}>
                にげる
              </button>
            </>
          )}
          {menu === "skill" && (
            <>
              {player.skills.map((skill) => (
                <button
                  key={skill.id}
                  className="btn btn--small"
                  disabled={player.mp < skill.mpCost}
                  onClick={() => handleSkillSelect(skill.id)}
                  title={skill.description}
                >
                  {skill.name} ({skill.mpCost}MP)
                </button>
              ))}
              <button className="btn btn--small" onClick={() => setMenu("main")}>
                もどる
              </button>
            </>
          )}
          {menu === "item" && (
            <>
              {consumables.length === 0 && (
                <span style={{ color: "var(--text-muted)", padding: "0.5rem" }}>
                  使えるアイテムがない
                </span>
              )}
              {consumables.map((inv) => {
                const item = ITEMS[inv.itemId];
                return (
                  <button
                    key={inv.itemId}
                    className="btn btn--small"
                    onClick={() => handleItemUse(inv.itemId)}
                  >
                    {item.name} x{inv.count}
                  </button>
                );
              })}
              <button className="btn btn--small" onClick={() => setMenu("main")}>
                もどる
              </button>
            </>
          )}
          {menu === "target" && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--warning)" }}>
              ターゲットを選んでください（敵をクリック）
              <button
                className="btn btn--small"
                style={{ marginLeft: "1rem" }}
                onClick={() => { setMenu("main"); setSelectedSkill(null); }}
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="battle__actions">
          <span style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)" }}>
            敵のターン...
          </span>
        </div>
      )}
    </div>
  );
}
