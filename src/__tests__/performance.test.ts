import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { MAPS } from "@/data/maps";

// Mock localStorage for save/load tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock);
  localStorageMock.clear();
  useGameStore.getState().initNewGame();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Performance: Game store initialization", () => {
  it("initNewGame should complete within 50ms", () => {
    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      useGameStore.getState().initNewGame();
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;
    expect(avgMs).toBeLessThan(50);
  });

  it("store state should be immediately accessible after init", () => {
    const start = performance.now();
    useGameStore.getState().initNewGame();
    const state = useGameStore.getState();
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
    expect(state.player.name).toBe("ニート");
    expect(state.gameStarted).toBe(true);
  });
});

describe("Performance: Battle system", () => {
  it("100 consecutive attacks should complete within 500ms", () => {
    useGameStore.getState().startBattle(["boss_black_company"]);
    // Boss has 300 HP, low player attack won't kill it quickly
    // Keep attack low to ensure enemy survives
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const battle = useGameStore.getState().battle;
      if (!battle || battle.phase === "victory" || battle.phase === "defeat") {
        // Restart battle if ended
        useGameStore.getState().initNewGame();
        useGameStore.getState().startBattle(["boss_black_company"]);
      }
      useGameStore.getState().playerAttack(0);
      // Run enemy turn if needed to cycle phases
      const afterAttack = useGameStore.getState().battle;
      if (afterAttack && afterAttack.phase === "enemy_turn") {
        // Heal player to prevent defeat
        useGameStore.setState((s) => ({
          player: { ...s.player, hp: s.player.maxHp },
        }));
        useGameStore.getState().enemyTurn();
      }
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it("startBattle should complete within 5ms per call", () => {
    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      useGameStore.getState().startBattle(["slime_laziness", "bat_anxiety"]);
      useGameStore.getState().endBattle();
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;
    expect(avgMs).toBeLessThan(5);
  });
});

describe("Performance: Map data generation", () => {
  it("accessing all map tile data should complete within 500ms", () => {
    const mapIds = Object.keys(MAPS);
    const start = performance.now();
    for (let iteration = 0; iteration < 100; iteration++) {
      for (const mapId of mapIds) {
        const map = MAPS[mapId];
        // Simulate rendering: iterate all tiles
        let passableCount = 0;
        let wallCount = 0;
        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const tile = map.tiles[y][x];
            if (tile.passable) passableCount++;
            else wallCount++;
          }
        }
        // Use values to prevent dead code elimination
        expect(passableCount + wallCount).toBe(map.width * map.height);
      }
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it("map NPC lookups should be efficient", () => {
    const iterations = 1000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      for (const map of Object.values(MAPS)) {
        for (const npc of map.npcs) {
          // Simulate NPC lookup by position
          const tile = map.tiles[npc.position.y]?.[npc.position.x];
          expect(tile).toBeDefined();
        }
      }
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

describe("Performance: Save/Load cycle", () => {
  it("save and load cycle should complete within 50ms", () => {
    // Set up some game state
    useGameStore.getState().gainExp(10);
    useGameStore.getState().addGold(200);
    useGameStore.getState().addItem("energy_drink", 3);
    useGameStore.getState().addSocialPoints(15);

    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      useGameStore.getState().saveGame("perf_test");
      useGameStore.getState().loadGame("perf_test");
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;
    expect(avgMs).toBeLessThan(50);
  });
});

describe("Performance: Inventory operations", () => {
  it("adding 1000 items should complete within 200ms", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      useGameStore.getState().addItem(`test_item_${i % 50}`, 1);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it("removing 1000 items should complete within 200ms", () => {
    // First add items
    for (let i = 0; i < 50; i++) {
      useGameStore.getState().addItem(`test_item_${i}`, 20);
    }

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      useGameStore.getState().removeItem(`test_item_${i % 50}`, 1);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it("mixed add/remove operations (1000 total) should complete within 200ms", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      if (i % 2 === 0) {
        useGameStore.getState().addItem(`mixed_item_${i % 30}`, 1);
      } else {
        useGameStore.getState().removeItem(`mixed_item_${i % 30}`, 1);
      }
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it("useItem should complete within 2ms per call on average", () => {
    // Add many cup_noodles
    useGameStore.getState().addItem("cup_noodle", 500);
    useGameStore.getState().takeDamage(40);

    const iterations = 100;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      // Reset HP to ensure healing works
      useGameStore.setState((s) => ({
        player: { ...s.player, hp: 10 },
      }));
      useGameStore.getState().useItem("cup_noodle");
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;
    expect(avgMs).toBeLessThan(2);
  });
});

describe("Performance: Player actions", () => {
  it("gainExp with multiple level-ups should complete within 10ms", () => {
    const start = performance.now();
    // Gain enough exp for ~10 level ups at once
    useGameStore.getState().gainExp(5000);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
    expect(useGameStore.getState().player.level).toBeGreaterThan(5);
  });

  it("1000 movePlayer calls should complete within 200ms", () => {
    const directions = ["up", "down", "left", "right"] as const;
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      useGameStore.getState().movePlayer(directions[i % 4]);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });
});
