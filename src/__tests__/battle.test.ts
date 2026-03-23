import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";

beforeEach(() => {
  useGameStore.getState().initNewGame();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("startBattle", () => {
  it("creates correct enemy instances", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const battle = useGameStore.getState().battle;
    expect(battle).not.toBeNull();
    expect(battle!.enemies).toHaveLength(1);
    expect(battle!.enemies[0].name).toBe("怠惰スライム");
    expect(battle!.enemies[0].hp).toBe(20);
    expect(battle!.enemies[0].maxHp).toBe(20);
    expect(battle!.phase).toBe("start");
  });

  it("creates multiple enemies with unique ids", () => {
    useGameStore.getState().startBattle(["slime_laziness", "slime_laziness"]);
    const battle = useGameStore.getState().battle;
    expect(battle!.enemies).toHaveLength(2);
    expect(battle!.enemies[0].id).toBe("slime_laziness_0");
    expect(battle!.enemies[1].id).toBe("slime_laziness_1");
  });

  it("initializes battle log", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const battle = useGameStore.getState().battle;
    expect(battle!.log.length).toBeGreaterThanOrEqual(1);
    expect(battle!.log[0]).toContain("怠惰スライム");
  });
});

describe("playerAttack", () => {
  it("deals damage to target enemy", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const hpBefore = useGameStore.getState().battle!.enemies[0].hp;
    useGameStore.getState().playerAttack(0);
    const hpAfter = useGameStore.getState().battle!.enemies[0].hp;
    expect(hpAfter).toBeLessThan(hpBefore);
  });

  it("adds attack message to battle log", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const logBefore = useGameStore.getState().battle!.log.length;
    useGameStore.getState().playerAttack(0);
    const logAfter = useGameStore.getState().battle!.log.length;
    expect(logAfter).toBeGreaterThan(logBefore);
  });

  it("sets phase to victory when all enemies are defeated", () => {
    // Use a weak enemy and boost player attack to guarantee kill
    useGameStore.getState().startBattle(["slime_laziness"]);
    // Boost attack massively to guarantee one-shot
    useGameStore.setState((s) => ({
      player: { ...s.player, attack: 999 },
    }));
    useGameStore.getState().playerAttack(0);
    const battle = useGameStore.getState().battle;
    expect(battle!.phase).toBe("victory");
    expect(battle!.enemies[0].hp).toBe(0);
  });

  it("transitions to enemy_turn phase if enemies survive", () => {
    useGameStore.getState().startBattle(["boss_black_company"]);
    useGameStore.getState().playerAttack(0);
    const battle = useGameStore.getState().battle;
    // Boss has 300 HP, player attack 8 won't kill it
    expect(battle!.phase).toBe("enemy_turn");
  });
});

describe("playerSkill", () => {
  it("consumes MP and deals damage", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const mpBefore = useGameStore.getState().player.mp;
    useGameStore.getState().playerSkill("slash", 0);
    const state = useGameStore.getState();
    // slash costs 3 MP
    expect(state.player.mp).toBe(mpBefore - 3);
    expect(state.battle!.enemies[0].hp).toBeLessThan(20);
  });

  it("does not use skill when MP is insufficient", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    // Drain all MP
    useGameStore.setState((s) => ({
      player: { ...s.player, mp: 0 },
    }));
    const hpBefore = useGameStore.getState().battle!.enemies[0].hp;
    useGameStore.getState().playerSkill("slash", 0);
    expect(useGameStore.getState().battle!.enemies[0].hp).toBe(hpBefore);
  });

  it("heal skill restores player HP", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    useGameStore.getState().takeDamage(30);
    const hpBefore = useGameStore.getState().player.hp;
    useGameStore.getState().playerSkill("heal", 0);
    expect(useGameStore.getState().player.hp).toBeGreaterThan(hpBefore);
  });
});

describe("playerFlee", () => {
  it("has 50% chance to flee (test both outcomes)", () => {
    let fleeSuccess = 0;
    let fleeFail = 0;

    // Run many attempts to verify both outcomes occur
    for (let i = 0; i < 100; i++) {
      useGameStore.getState().initNewGame();
      useGameStore.getState().startBattle(["slime_laziness"]);
      const result = useGameStore.getState().playerFlee();
      if (result) fleeSuccess++;
      else fleeFail++;
    }

    // Both outcomes should occur in 100 attempts
    expect(fleeSuccess).toBeGreaterThan(0);
    expect(fleeFail).toBeGreaterThan(0);
  });

  it("sets phase to victory on successful flee", () => {
    // Mock random to always succeed
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    useGameStore.getState().startBattle(["slime_laziness"]);
    const result = useGameStore.getState().playerFlee();
    expect(result).toBe(true);
    expect(useGameStore.getState().battle!.phase).toBe("victory");
    vi.restoreAllMocks();
  });

  it("sets phase to enemy_turn on failed flee", () => {
    // Mock random to always fail
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    useGameStore.getState().startBattle(["slime_laziness"]);
    const result = useGameStore.getState().playerFlee();
    expect(result).toBe(false);
    expect(useGameStore.getState().battle!.phase).toBe("enemy_turn");
    vi.restoreAllMocks();
  });
});

describe("enemyTurn", () => {
  it("deals damage to player", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    const hpBefore = useGameStore.getState().player.hp;
    useGameStore.getState().enemyTurn();
    expect(useGameStore.getState().player.hp).toBeLessThan(hpBefore);
  });

  it("sets phase to player_turn after enemy attacks", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    useGameStore.getState().enemyTurn();
    expect(useGameStore.getState().battle!.phase).toBe("player_turn");
  });

  it("sets phase to defeat when player HP reaches 0", () => {
    // Mock random to ensure consistent damage (variance = 0.8 + 0.5*0.4 = 1.0)
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    useGameStore.getState().startBattle(["slime_laziness"]);
    // Set player HP very low so any attack kills
    useGameStore.setState((s) => ({
      player: { ...s.player, hp: 1, defense: 0 },
    }));
    useGameStore.getState().enemyTurn();
    const state = useGameStore.getState();
    expect(state.player.hp).toBe(0);
    expect(state.battle!.phase).toBe("defeat");
    vi.restoreAllMocks();
  });

  it("skips dead enemies", () => {
    useGameStore.getState().startBattle(["slime_laziness", "slime_laziness"]);
    // Kill first enemy
    useGameStore.setState((s) => ({
      battle: s.battle
        ? {
            ...s.battle,
            enemies: s.battle.enemies.map((e, i) =>
              i === 0 ? { ...e, hp: 0 } : e,
            ),
          }
        : null,
    }));
    const hpBefore = useGameStore.getState().player.hp;
    useGameStore.getState().enemyTurn();
    const hpAfter = useGameStore.getState().player.hp;
    // Only one enemy should have attacked (the alive one)
    const damageTaken = hpBefore - hpAfter;
    expect(damageTaken).toBeGreaterThan(0);
  });
});

describe("endBattle", () => {
  it("clears battle state", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    expect(useGameStore.getState().battle).not.toBeNull();
    useGameStore.getState().endBattle();
    expect(useGameStore.getState().battle).toBeNull();
  });
});
