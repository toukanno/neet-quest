import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useGameStore } from "@/store/gameStore";

// Mock localStorage
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

describe("saveGame", () => {
  it("saves game data to localStorage", () => {
    useGameStore.getState().saveGame("1");
    const raw = localStorage.getItem("neetquest_save_1");
    expect(raw).not.toBeNull();
    const data = JSON.parse(raw!);
    expect(data.id).toBe("1");
    expect(data.player.name).toBe("ニート");
    expect(data.gold).toBe(100);
    expect(data.currentMapId).toBe("my_room");
  });

  it("saves current player state after modifications", () => {
    useGameStore.getState().gainExp(10);
    useGameStore.getState().addGold(200);
    useGameStore.getState().addItem("energy_drink", 2);
    useGameStore.getState().saveGame("2");

    const raw = localStorage.getItem("neetquest_save_2");
    const data = JSON.parse(raw!);
    expect(data.player.exp).toBe(10);
    expect(data.gold).toBe(300);
    const energyDrink = data.inventory.find(
      (i: { itemId: string }) => i.itemId === "energy_drink"
    );
    expect(energyDrink?.count).toBe(2);
  });

  it("includes timestamp in save data", () => {
    const before = Date.now();
    useGameStore.getState().saveGame("1");
    const after = Date.now();

    const raw = localStorage.getItem("neetquest_save_1");
    const data = JSON.parse(raw!);
    expect(data.timestamp).toBeGreaterThanOrEqual(before);
    expect(data.timestamp).toBeLessThanOrEqual(after);
  });

  it("saves quest progress", () => {
    useGameStore.getState().addSocialPoints(42);
    useGameStore.getState().saveGame("1");

    const raw = localStorage.getItem("neetquest_save_1");
    const data = JSON.parse(raw!);
    expect(data.activeQuests).toEqual(["main_1"]);
    expect(data.completedQuests).toEqual([]);
    expect(data.socialPoints).toBe(42);
  });
});

describe("loadGame", () => {
  it("restores full state from a save", () => {
    useGameStore.getState().gainExp(15);
    useGameStore.getState().addGold(50);
    useGameStore.getState().addSocialPoints(10);
    useGameStore.getState().saveGame("1");

    // Reset state
    useGameStore.getState().initNewGame();
    expect(useGameStore.getState().player.exp).toBe(0);
    expect(useGameStore.getState().gold).toBe(100);

    // Load saved state
    const result = useGameStore.getState().loadGame("1");
    expect(result).toBe(true);
    expect(useGameStore.getState().player.exp).toBe(15);
    expect(useGameStore.getState().gold).toBe(150);
    expect(useGameStore.getState().socialPoints).toBe(10);
  });

  it("returns false for non-existent save slot", () => {
    const result = useGameStore.getState().loadGame("999");
    expect(result).toBe(false);
  });

  it("returns false for empty slot", () => {
    const result = useGameStore.getState().loadGame("3");
    expect(result).toBe(false);
  });

  it("restores inventory correctly", () => {
    useGameStore.getState().addItem("energy_drink", 5);
    useGameStore.getState().removeItem("cup_noodle", 3);
    useGameStore.getState().saveGame("1");

    useGameStore.getState().initNewGame();
    useGameStore.getState().loadGame("1");

    const state = useGameStore.getState();
    const energyDrink = state.inventory.find(
      (i) => i.itemId === "energy_drink"
    );
    expect(energyDrink?.count).toBe(5);
    const cupNoodle = state.inventory.find((i) => i.itemId === "cup_noodle");
    expect(cupNoodle).toBeUndefined();
  });

  it("clears battle and dialogue state on load", () => {
    useGameStore.getState().startBattle(["slime_laziness"]);
    expect(useGameStore.getState().battle).not.toBeNull();

    useGameStore.getState().saveGame("1");
    useGameStore.getState().loadGame("1");

    expect(useGameStore.getState().battle).toBeNull();
    expect(useGameStore.getState().currentDialogue).toBeNull();
    expect(useGameStore.getState().currentNpcId).toBeNull();
  });

  it("sets gameStarted to true on load", () => {
    useGameStore.getState().saveGame("1");
    useGameStore.setState({ gameStarted: false });
    useGameStore.getState().loadGame("1");
    expect(useGameStore.getState().gameStarted).toBe(true);
  });

  it("restores map position correctly", () => {
    useGameStore.getState().movePlayer("up");
    useGameStore.getState().saveGame("1");

    useGameStore.getState().initNewGame();
    useGameStore.getState().loadGame("1");

    expect(useGameStore.getState().playerPosition).toEqual({ x: 3, y: 2 });
    expect(useGameStore.getState().currentMapId).toBe("my_room");
  });
});

describe("getSaveSlots", () => {
  it("returns null for empty slots", () => {
    const slots = useGameStore.getState().getSaveSlots();
    expect(slots).toHaveLength(3);
    expect(slots[0]).toBeNull();
    expect(slots[1]).toBeNull();
    expect(slots[2]).toBeNull();
  });

  it("returns save data for occupied slots", () => {
    useGameStore.getState().saveGame("1");
    useGameStore.getState().saveGame("3");

    const slots = useGameStore.getState().getSaveSlots();
    expect(slots[0]).not.toBeNull();
    expect(slots[0]!.id).toBe("1");
    expect(slots[1]).toBeNull();
    expect(slots[2]).not.toBeNull();
    expect(slots[2]!.id).toBe("3");
  });
});
