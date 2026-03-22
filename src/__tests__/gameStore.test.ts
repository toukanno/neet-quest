import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "@/store/gameStore";

// Reset store state before each test
beforeEach(() => {
  useGameStore.getState().initNewGame();
});

describe("initNewGame", () => {
  it("sets correct default player stats", () => {
    const state = useGameStore.getState();
    expect(state.player.name).toBe("ニート");
    expect(state.player.level).toBe(1);
    expect(state.player.hp).toBe(50);
    expect(state.player.maxHp).toBe(50);
    expect(state.player.mp).toBe(20);
    expect(state.player.maxMp).toBe(20);
    expect(state.player.attack).toBe(8);
    expect(state.player.defense).toBe(5);
    expect(state.player.speed).toBe(5);
    expect(state.player.exp).toBe(0);
    expect(state.player.expToNext).toBe(30);
  });

  it("sets correct default game state", () => {
    const state = useGameStore.getState();
    expect(state.gold).toBe(100);
    expect(state.socialPoints).toBe(0);
    expect(state.currentMapId).toBe("my_room");
    expect(state.playerPosition).toEqual({ x: 3, y: 3 });
    expect(state.activeQuests).toEqual(["main_1"]);
    expect(state.completedQuests).toEqual([]);
    expect(state.battle).toBeNull();
    expect(state.chapter).toBe(1);
    expect(state.gameStarted).toBe(true);
  });

  it("sets default inventory with 3 items", () => {
    const state = useGameStore.getState();
    expect(state.inventory).toEqual([
      { itemId: "cup_noodle", count: 3 },
      { itemId: "wooden_sword", count: 1 },
      { itemId: "hoodie", count: 1 },
    ]);
  });
});

describe("gainExp", () => {
  it("adds exp without leveling up", () => {
    useGameStore.getState().gainExp(10);
    const state = useGameStore.getState();
    expect(state.player.exp).toBe(10);
    expect(state.player.level).toBe(1);
  });

  it("levels up when exp crosses boundary", () => {
    // expToNext at level 1 is 30
    useGameStore.getState().gainExp(30);
    const state = useGameStore.getState();
    expect(state.player.level).toBe(2);
    expect(state.player.exp).toBe(0);
    // Stats increase on level up: maxHp +8, maxMp +4, attack +2, defense +2, speed +1
    expect(state.player.maxHp).toBe(58);
    expect(state.player.maxMp).toBe(24);
    expect(state.player.attack).toBe(10);
    expect(state.player.defense).toBe(7);
    expect(state.player.speed).toBe(6);
  });

  it("fully heals HP and MP on level up", () => {
    // Damage the player first
    useGameStore.getState().takeDamage(20);
    expect(useGameStore.getState().player.hp).toBe(30);
    // Level up should fully heal
    useGameStore.getState().gainExp(30);
    const state = useGameStore.getState();
    expect(state.player.hp).toBe(state.player.maxHp);
    expect(state.player.mp).toBe(state.player.maxMp);
  });

  it("handles multiple level ups from large exp gain", () => {
    // Level 1 expToNext=30, Level 2 expToNext=floor(30*1.3)=39
    // 30+39=69 total needed for level 3
    useGameStore.getState().gainExp(69);
    const state = useGameStore.getState();
    expect(state.player.level).toBe(3);
    expect(state.player.exp).toBe(0);
  });
});

describe("takeDamage / healHp", () => {
  it("reduces HP by damage amount", () => {
    useGameStore.getState().takeDamage(15);
    expect(useGameStore.getState().player.hp).toBe(35);
  });

  it("clamps HP to 0 minimum", () => {
    useGameStore.getState().takeDamage(999);
    expect(useGameStore.getState().player.hp).toBe(0);
  });

  it("heals HP by amount", () => {
    useGameStore.getState().takeDamage(30);
    useGameStore.getState().healHp(20);
    expect(useGameStore.getState().player.hp).toBe(40);
  });

  it("clamps HP to maxHp ceiling", () => {
    useGameStore.getState().takeDamage(10);
    useGameStore.getState().healHp(999);
    expect(useGameStore.getState().player.hp).toBe(50);
  });
});

describe("addItem / removeItem", () => {
  it("increases count of existing item", () => {
    useGameStore.getState().addItem("cup_noodle", 2);
    const item = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "cup_noodle");
    expect(item?.count).toBe(5);
  });

  it("adds new item to inventory", () => {
    useGameStore.getState().addItem("energy_drink", 1);
    const item = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "energy_drink");
    expect(item?.count).toBe(1);
  });

  it("decreases item count", () => {
    useGameStore.getState().removeItem("cup_noodle", 1);
    const item = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "cup_noodle");
    expect(item?.count).toBe(2);
  });

  it("removes item from inventory when count reaches 0", () => {
    useGameStore.getState().removeItem("cup_noodle", 3);
    const item = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "cup_noodle");
    expect(item).toBeUndefined();
  });
});

describe("useItem", () => {
  it("heals HP and removes item from inventory", () => {
    useGameStore.getState().takeDamage(40);
    expect(useGameStore.getState().player.hp).toBe(10);
    useGameStore.getState().useItem("cup_noodle");
    // cup_noodle heals 30 HP
    expect(useGameStore.getState().player.hp).toBe(40);
    const item = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "cup_noodle");
    expect(item?.count).toBe(2);
  });

  it("does nothing for item not in inventory", () => {
    const before = useGameStore.getState().player.hp;
    useGameStore.getState().useItem("bento");
    expect(useGameStore.getState().player.hp).toBe(before);
  });
});

describe("equipItem", () => {
  it("equips weapon and adjusts attack stat", () => {
    // wooden_sword has attack: 3
    useGameStore.getState().equipItem("wooden_sword");
    const state = useGameStore.getState();
    expect(state.player.equipment.weapon?.id).toBe("wooden_sword");
    expect(state.player.attack).toBe(8 + 3); // base 8 + weapon 3
    // wooden_sword should be removed from inventory
    const inInventory = state.inventory.find(
      (i) => i.itemId === "wooden_sword"
    );
    expect(inInventory).toBeUndefined();
  });

  it("swaps equipment and returns old item to inventory", () => {
    useGameStore.getState().equipItem("wooden_sword");
    // Add keyboard to inventory then equip it
    useGameStore.getState().addItem("keyboard", 1);
    useGameStore.getState().equipItem("keyboard");
    const state = useGameStore.getState();
    expect(state.player.equipment.weapon?.id).toBe("keyboard");
    // attack should be base 8 + keyboard 7 = 15 (wooden_sword stats removed)
    expect(state.player.attack).toBe(8 + 7);
    // wooden_sword should be back in inventory
    const oldWeapon = state.inventory.find(
      (i) => i.itemId === "wooden_sword"
    );
    expect(oldWeapon).toBeDefined();
  });

  it("equips armor and adjusts defense stat", () => {
    // hoodie has defense: 4
    useGameStore.getState().equipItem("hoodie");
    const state = useGameStore.getState();
    expect(state.player.equipment.armor?.id).toBe("hoodie");
    expect(state.player.defense).toBe(5 + 4); // base 5 + armor 4
  });
});

describe("addGold", () => {
  it("adds gold to current total", () => {
    useGameStore.getState().addGold(50);
    expect(useGameStore.getState().gold).toBe(150);
  });

  it("can subtract gold with negative amount", () => {
    useGameStore.getState().addGold(-30);
    expect(useGameStore.getState().gold).toBe(70);
  });
});

describe("movePlayer", () => {
  it("moves player in valid direction", () => {
    // Start at (3,3) in my_room, move up to (3,2) which is floor
    useGameStore.getState().movePlayer("up");
    expect(useGameStore.getState().playerPosition).toEqual({ x: 3, y: 2 });
  });

  it("does not move into walls", () => {
    // Move to top-left corner area where walls are
    // Start at (3,3), move up twice to (3,1), then left twice to (1,1), then up to (1,0) which is wall
    useGameStore.getState().movePlayer("up"); // (3,2)
    useGameStore.getState().movePlayer("up"); // (3,1)
    useGameStore.getState().movePlayer("left"); // (2,1)
    useGameStore.getState().movePlayer("left"); // (1,1)
    useGameStore.getState().movePlayer("up"); // wall at (1,0), should stay at (1,1)
    expect(useGameStore.getState().playerPosition).toEqual({ x: 1, y: 1 });
  });

  it("does not move out of map boundaries", () => {
    // Move left from (3,3) multiple times to reach boundary
    useGameStore.getState().movePlayer("left"); // (2,3)
    useGameStore.getState().movePlayer("left"); // (1,3)
    useGameStore.getState().movePlayer("left"); // (0,3) is wall
    useGameStore.getState().movePlayer("left"); // still wall at (0,3), can't go further
    // Player should be at (1,3) since (0,3) is a wall
    expect(useGameStore.getState().playerPosition).toEqual({ x: 1, y: 3 });
  });
});

describe("acceptQuest / completeQuest", () => {
  it("accepts a quest", () => {
    // main_1 is already active from initNewGame, accept sub_exercise which has no prereq
    useGameStore.getState().acceptQuest("sub_exercise");
    expect(useGameStore.getState().activeQuests).toContain("sub_exercise");
  });

  it("does not accept duplicate quest", () => {
    useGameStore.getState().acceptQuest("main_1");
    const count = useGameStore
      .getState()
      .activeQuests.filter((id) => id === "main_1").length;
    expect(count).toBe(1);
  });

  it("does not accept quest with unmet prerequisite", () => {
    // main_2 requires main_1 to be completed
    useGameStore.getState().acceptQuest("main_2");
    expect(useGameStore.getState().activeQuests).not.toContain("main_2");
  });

  it("completeQuest gives rewards and moves quest to completed", () => {
    vi.useFakeTimers();
    // Complete main_1: rewards are exp:20, gold:0, items:["room_key"], socialPoints:5
    useGameStore.getState().completeQuest("main_1");
    const state = useGameStore.getState();
    expect(state.completedQuests).toContain("main_1");
    expect(state.activeQuests).not.toContain("main_1");
    // Check rewards
    expect(state.socialPoints).toBe(5);
    const roomKey = state.inventory.find((i) => i.itemId === "room_key");
    expect(roomKey).toBeDefined();
    vi.useRealTimers();
  });
});

describe("addSocialPoints", () => {
  it("adds social points", () => {
    useGameStore.getState().addSocialPoints(10);
    expect(useGameStore.getState().socialPoints).toBe(10);
  });

  it("accumulates social points", () => {
    useGameStore.getState().addSocialPoints(5);
    useGameStore.getState().addSocialPoints(15);
    expect(useGameStore.getState().socialPoints).toBe(20);
  });
});
