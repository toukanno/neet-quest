import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/store/gameStore";

beforeEach(() => {
  useGameStore.getState().initNewGame();
});

describe("useItem - heal_mp effect", () => {
  it("restores MP with energy_drink", () => {
    // Drain some MP first
    useGameStore.setState((s) => ({
      player: { ...s.player, mp: 5 },
    }));
    useGameStore.getState().addItem("energy_drink", 1);
    useGameStore.getState().useItem("energy_drink");
    // energy_drink heals 20 MP, max is 20
    expect(useGameStore.getState().player.mp).toBe(20);
  });

  it("clamps MP to maxMp", () => {
    useGameStore.setState((s) => ({
      player: { ...s.player, mp: 15 },
    }));
    useGameStore.getState().addItem("energy_drink", 1);
    useGameStore.getState().useItem("energy_drink");
    expect(useGameStore.getState().player.mp).toBe(20);
  });
});

describe("useItem - buff_attack effect", () => {
  it("increases attack with protein", () => {
    const attackBefore = useGameStore.getState().player.attack;
    useGameStore.getState().addItem("protein", 1);
    useGameStore.getState().useItem("protein");
    // protein buff_attack value is 5
    expect(useGameStore.getState().player.attack).toBe(attackBefore + 5);
  });

  it("removes protein from inventory after use", () => {
    useGameStore.getState().addItem("protein", 1);
    useGameStore.getState().useItem("protein");
    const protein = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "protein");
    expect(protein).toBeUndefined();
  });
});

describe("useItem - heal_hp with bento", () => {
  it("heals more HP than cup_noodle", () => {
    useGameStore.getState().takeDamage(45);
    expect(useGameStore.getState().player.hp).toBe(5);
    useGameStore.getState().addItem("bento", 1);
    useGameStore.getState().useItem("bento");
    // bento heals 60 HP, but maxHp is 50
    expect(useGameStore.getState().player.hp).toBe(50);
  });
});

describe("useItem - item without effect", () => {
  it("does nothing for key items", () => {
    useGameStore.getState().addItem("room_key", 1);
    const hpBefore = useGameStore.getState().player.hp;
    const mpBefore = useGameStore.getState().player.mp;
    useGameStore.getState().useItem("room_key");
    // Key item has no effect, should not change stats
    expect(useGameStore.getState().player.hp).toBe(hpBefore);
    expect(useGameStore.getState().player.mp).toBe(mpBefore);
    // Key item should still be in inventory (not consumed)
    const roomKey = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "room_key");
    expect(roomKey).toBeDefined();
  });
});

describe("equipItem - accessory slot", () => {
  it("equips sneakers and adjusts speed stat", () => {
    useGameStore.getState().addItem("sneakers", 1);
    useGameStore.getState().equipItem("sneakers");
    const state = useGameStore.getState();
    expect(state.player.equipment.accessory?.id).toBe("sneakers");
    expect(state.player.speed).toBe(5 + 5); // base 5 + sneakers 5
    const inInventory = state.inventory.find(
      (i) => i.itemId === "sneakers"
    );
    expect(inInventory).toBeUndefined();
  });

  it("equips earphones with multiple stat bonuses", () => {
    useGameStore.getState().addItem("earphones", 1);
    useGameStore.getState().equipItem("earphones");
    const state = useGameStore.getState();
    expect(state.player.equipment.accessory?.id).toBe("earphones");
    // earphones: attack +3, speed +2
    expect(state.player.attack).toBe(8 + 3);
    expect(state.player.speed).toBe(5 + 2);
  });

  it("swaps accessory and restores old stats", () => {
    useGameStore.getState().addItem("sneakers", 1);
    useGameStore.getState().addItem("earphones", 1);

    useGameStore.getState().equipItem("sneakers");
    expect(useGameStore.getState().player.speed).toBe(5 + 5);

    useGameStore.getState().equipItem("earphones");
    const state = useGameStore.getState();
    // sneakers speed removed, earphones speed+attack added
    expect(state.player.speed).toBe(5 + 2); // base + earphones
    expect(state.player.attack).toBe(8 + 3); // base + earphones
    // sneakers should be back in inventory
    const sneakers = state.inventory.find((i) => i.itemId === "sneakers");
    expect(sneakers).toBeDefined();
  });
});

describe("equipItem - armor upgrade", () => {
  it("upgrades from hoodie to business_suit", () => {
    useGameStore.getState().addItem("business_suit", 1);
    useGameStore.getState().equipItem("hoodie");
    expect(useGameStore.getState().player.defense).toBe(5 + 4);

    useGameStore.getState().equipItem("business_suit");
    const state = useGameStore.getState();
    expect(state.player.equipment.armor?.id).toBe("business_suit");
    // defense: base 5 + business_suit 10 (hoodie 4 removed)
    expect(state.player.defense).toBe(5 + 10);
    // hoodie returned to inventory
    const hoodie = state.inventory.find((i) => i.itemId === "hoodie");
    expect(hoodie).toBeDefined();
  });
});

describe("equipItem - weapon upgrade chain", () => {
  it("upgrades from wooden_sword to keyboard to resume_sword", () => {
    useGameStore.getState().addItem("keyboard", 1);
    useGameStore.getState().addItem("resume_sword", 1);

    // Equip wooden_sword (already in inventory from init)
    useGameStore.getState().equipItem("wooden_sword");
    expect(useGameStore.getState().player.attack).toBe(8 + 3);

    // Upgrade to keyboard
    useGameStore.getState().equipItem("keyboard");
    expect(useGameStore.getState().player.attack).toBe(8 + 7);

    // Upgrade to resume_sword
    useGameStore.getState().equipItem("resume_sword");
    const state = useGameStore.getState();
    expect(state.player.attack).toBe(8 + 12);
    expect(state.player.equipment.weapon?.id).toBe("resume_sword");
    // keyboard should be back in inventory
    const kb = state.inventory.find((i) => i.itemId === "keyboard");
    expect(kb).toBeDefined();
  });
});

describe("equipItem - non-equipment item", () => {
  it("does nothing for consumable items", () => {
    const stateBefore = useGameStore.getState().player;
    useGameStore.getState().equipItem("cup_noodle");
    const stateAfter = useGameStore.getState().player;
    expect(stateAfter.equipment).toEqual(stateBefore.equipment);
    // cup_noodle should still be in inventory
    const cupNoodle = useGameStore
      .getState()
      .inventory.find((i) => i.itemId === "cup_noodle");
    expect(cupNoodle?.count).toBe(3);
  });
});
