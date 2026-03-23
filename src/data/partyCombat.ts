import type { Character } from "@/types/game";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PartyAction {
  memberId: string;
  memberName: string;
  type: "attack" | "skill";
  skillId?: string;
  targetIndex?: number;
  targetAlly?: boolean;
}

export interface PartyBattleContext {
  player: { hp: number; maxHp: number };
  party: Character[];
  enemies: { hp: number; maxHp: number; defense: number }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return a random number in [0, 1). Extracted so tests can mock it. */
export const roll = (): number => Math.random();

function findLowestHpEnemyIndex(
  enemies: { hp: number; maxHp: number }[],
): number {
  let idx = -1;
  let minHp = Infinity;

  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp > 0 && enemies[i].hp < minHp) {
      minHp = enemies[i].hp;
      idx = i;
    }
  }

  return idx;
}

function findStrongestEnemyIndex(
  enemies: { hp: number; maxHp: number }[],
): number {
  let idx = -1;
  let maxHp = -1;

  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp > 0 && enemies[i].hp > maxHp) {
      maxHp = enemies[i].hp;
      idx = i;
    }
  }

  return idx;
}

function basicAttack(member: Character, targetIndex: number): PartyAction {
  return {
    memberId: member.id,
    memberName: member.name,
    type: "attack",
    targetIndex,
  };
}

function pickSkill(
  member: Character,
  skillId: string,
  options: { targetIndex?: number; targetAlly?: boolean } = {},
): PartyAction {
  return {
    memberId: member.id,
    memberName: member.name,
    type: "skill",
    skillId,
    targetIndex: options.targetIndex,
    targetAlly: options.targetAlly,
  };
}

// ---------------------------------------------------------------------------
// Per-member decision functions
// ---------------------------------------------------------------------------

function decideYuki(
  yuki: Character,
  context: PartyBattleContext,
): PartyAction {
  const fallbackTarget = findLowestHpEnemyIndex(context.enemies);

  // Priority 1: Heal player when HP < 40%
  const playerHpRatio = context.player.hp / context.player.maxHp;
  if (playerHpRatio < 0.4 && yuki.mp >= 4) {
    return pickSkill(yuki, "heal", { targetAlly: true });
  }

  // Priority 2: Heal any party member with HP < 50%
  for (let i = 0; i < context.party.length; i++) {
    const member = context.party[i];
    if (member.hp > 0 && member.hp / member.maxHp < 0.5 && yuki.mp >= 4) {
      return pickSkill(yuki, "heal", { targetIndex: i, targetAlly: true });
    }
  }

  // Priority 3: 30% chance to use sketch_barrier on player if MP >= 6
  if (yuki.mp >= 6 && roll() < 0.3) {
    return pickSkill(yuki, "sketch_barrier", { targetAlly: true });
  }

  // Fallback: basic attack on lowest HP enemy
  return basicAttack(yuki, fallbackTarget);
}

function decideDaisuke(
  daisuke: Character,
  context: PartyBattleContext,
): PartyAction {
  const lowestIdx = findLowestHpEnemyIndex(context.enemies);
  const strongestIdx = findStrongestEnemyIndex(context.enemies);

  // Priority 1: fire_magic on strongest enemy when its HP > 50%
  if (daisuke.mp >= 10 && strongestIdx >= 0) {
    const strongest = context.enemies[strongestIdx];
    if (strongest.hp / strongest.maxHp > 0.5) {
      return pickSkill(daisuke, "fire_magic", { targetIndex: strongestIdx });
    }
  }

  // Priority 2: 50% chance to use debug on lowest HP enemy
  if (daisuke.mp >= 10 && roll() < 0.5) {
    return pickSkill(daisuke, "debug", { targetIndex: lowestIdx });
  }

  // Fallback: basic attack on lowest HP enemy
  return basicAttack(daisuke, lowestIdx);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Choose actions for all party members based on the current battle state.
 *
 * Each alive party member will produce one `PartyAction`. The returned
 * array is ordered by the party array order, so the battle system can
 * execute them sequentially after the player's turn.
 */
export function choosePartyActions(context: PartyBattleContext): PartyAction[] {
  const actions: PartyAction[] = [];

  for (const member of context.party) {
    // Skip dead members
    if (member.hp <= 0) continue;

    switch (member.id) {
      case "yuki":
        actions.push(decideYuki(member, context));
        break;
      case "daisuke":
        actions.push(decideDaisuke(member, context));
        break;
      default: {
        // Unknown party member -- basic attack on lowest HP enemy
        const target = findLowestHpEnemyIndex(context.enemies);
        actions.push(basicAttack(member, target));
        break;
      }
    }
  }

  return actions;
}
