import type { Enemy, Skill } from "@/types/game";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EnemyAIPattern = "aggressive" | "defensive" | "support" | "boss";

export interface EnemyAction {
  type: "attack" | "skill";
  skillId?: string;
}

export interface PlayerSnapshot {
  hp: number;
  maxHp: number;
  defense?: number;
}

export interface EnemyBattleState {
  turnCount: number;
  currentHp: number;
  maxHp: number;
}

// ---------------------------------------------------------------------------
// AI pattern mapping
// ---------------------------------------------------------------------------

export const ENEMY_AI_PATTERNS: Record<string, EnemyAIPattern> = {
  slime_laziness: "aggressive",
  bat_anxiety: "aggressive",
  goblin_procrastination: "defensive",
  skeleton_deadline: "aggressive",
  wolf_comparison: "support",
  interviewer_golem: "aggressive",
  boss_black_company: "boss",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a random number in [0, 1). Extracted so tests can mock it. */
export const roll = (): number => Math.random();

function findSkill(enemy: Enemy, skillId: string): Skill | undefined {
  return enemy.skills.find((s) => s.id === skillId);
}

function basicAttack(): EnemyAction {
  return { type: "attack" };
}

function chooseSkill(skillId: string): EnemyAction {
  return { type: "skill", skillId };
}

// ---------------------------------------------------------------------------
// Per-enemy decision functions
// ---------------------------------------------------------------------------

function decideSlimeOrBat(): EnemyAction {
  return basicAttack();
}

function decideGoblin(enemy: Enemy): EnemyAction {
  if (findSkill(enemy, "debuff_def") && roll() < 0.3) {
    return chooseSkill("debuff_def");
  }
  return basicAttack();
}

function decideSkeleton(enemy: Enemy): EnemyAction {
  if (findSkill(enemy, "slash") && roll() < 0.4) {
    return chooseSkill("slash");
  }
  return basicAttack();
}

function decideWolf(enemy: Enemy, battleState: EnemyBattleState): EnemyAction {
  const hasBuffSkill = findSkill(enemy, "buff_atk");
  if (!hasBuffSkill) return basicAttack();

  const isFirstTurn = battleState.turnCount <= 1;
  const buffChance = isFirstTurn ? 0.6 : 0.3;

  if (roll() < buffChance) {
    return chooseSkill("buff_atk");
  }
  return basicAttack();
}

function decideInterviewerGolem(
  enemy: Enemy,
  player: PlayerSnapshot,
): EnemyAction {
  const hpRatio = player.hp / player.maxHp;
  const hasSlash = findSkill(enemy, "slash");
  const hasDebuff = findSkill(enemy, "debuff_def");

  if (hpRatio <= 0.5) {
    // Player is weakened -- press the advantage with slash
    if (hasSlash && roll() < 0.7) {
      return chooseSkill("slash");
    }
    return basicAttack();
  }

  // Player HP > 50%
  const r = roll();
  if (hasSlash && r < 0.5) {
    return chooseSkill("slash");
  }
  if (hasDebuff && r < 0.7) {
    // 0.5..0.7 => 20% band
    return chooseSkill("debuff_def");
  }
  return basicAttack();
}

function decideBossBlackCompany(
  enemy: Enemy,
  player: PlayerSnapshot,
  battleState: EnemyBattleState,
): EnemyAction {
  const bossHpRatio = battleState.currentHp / battleState.maxHp;
  const playerHpRatio = player.hp / player.maxHp;

  const hasFireMagic = findSkill(enemy, "fire_magic");
  const hasDebuffDef = findSkill(enemy, "debuff_def");
  const hasBuffAtk = findSkill(enemy, "buff_atk");

  // Desperation phase: below 30% HP -- always fire_magic
  if (bossHpRatio < 0.3 && hasFireMagic) {
    return chooseSkill("fire_magic");
  }

  // High HP phase: buff self when above 70%
  if (bossHpRatio > 0.7 && hasBuffAtk && roll() < 0.5) {
    return chooseSkill("buff_atk");
  }

  // Player is still healthy -- burn them down
  if (playerHpRatio > 0.5 && hasFireMagic && roll() < 0.6) {
    return chooseSkill("fire_magic");
  }

  // Player has high defense -- debuff
  const highDefenseThreshold = 15;
  if (
    player.defense !== undefined &&
    player.defense >= highDefenseThreshold &&
    hasDebuffDef &&
    roll() < 0.5
  ) {
    return chooseSkill("debuff_def");
  }

  return basicAttack();
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Choose the next action for an enemy based on its AI pattern,
 * the current player state, and the enemy's own battle state.
 *
 * `battleState` tracks per-encounter information such as turn count
 * and the enemy's current / max HP (which may differ from the base
 * template values in the Enemy definition).
 */
export function chooseEnemyAction(
  enemy: Enemy,
  player: PlayerSnapshot,
  battleState: EnemyBattleState = { turnCount: 1, currentHp: enemy.hp, maxHp: enemy.maxHp },
): EnemyAction {
  switch (enemy.id) {
    case "slime_laziness":
    case "bat_anxiety":
      return decideSlimeOrBat();

    case "goblin_procrastination":
      return decideGoblin(enemy);

    case "skeleton_deadline":
      return decideSkeleton(enemy);

    case "wolf_comparison":
      return decideWolf(enemy, battleState);

    case "interviewer_golem":
      return decideInterviewerGolem(enemy, player);

    case "boss_black_company":
      return decideBossBlackCompany(enemy, player, battleState);

    default:
      // Unknown enemy -- fall back to basic attack or random skill
      if (enemy.skills.length > 0 && roll() < 0.3) {
        const randomSkill =
          enemy.skills[Math.floor(roll() * enemy.skills.length)];
        return chooseSkill(randomSkill.id);
      }
      return basicAttack();
  }
}
