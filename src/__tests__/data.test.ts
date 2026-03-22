import { describe, it, expect } from "vitest";
import { ITEMS } from "@/data/items";
import { ENEMIES } from "@/data/enemies";
import { QUESTS } from "@/data/quests";
import { SKILLS } from "@/data/skills";
import { MAPS } from "@/data/maps";

describe("Items data integrity", () => {
  it("all items have required fields", () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      expect(item.id, `${key} missing id`).toBe(key);
      expect(item.name, `${key} missing name`).toBeTruthy();
      expect(item.description, `${key} missing description`).toBeTruthy();
      expect(item.type, `${key} missing type`).toMatch(
        /^(consumable|equipment|key)$/
      );
      expect(item.price, `${key} price should be a number`).toBeTypeOf(
        "number"
      );
    }
  });

  it("consumable items have effect", () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "consumable") {
        expect(item.effect, `${key} consumable missing effect`).toBeDefined();
        expect(
          item.effect!.type,
          `${key} effect missing type`
        ).toBeTruthy();
        expect(
          item.effect!.value,
          `${key} effect value should be positive`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("equipment items have equipSlot and stats", () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "equipment") {
        expect(
          item.equipSlot,
          `${key} equipment missing equipSlot`
        ).toMatch(/^(weapon|armor|accessory)$/);
        expect(item.stats, `${key} equipment missing stats`).toBeDefined();
      }
    }
  });
});

describe("Enemies data integrity", () => {
  it("all enemies have required fields", () => {
    for (const [key, enemy] of Object.entries(ENEMIES)) {
      expect(enemy.id, `${key} missing id`).toBe(key);
      expect(enemy.name, `${key} missing name`).toBeTruthy();
      expect(enemy.level, `${key} level should be positive`).toBeGreaterThan(
        0
      );
      expect(enemy.hp, `${key} hp should be positive`).toBeGreaterThan(0);
      expect(enemy.maxHp, `${key} maxHp should be positive`).toBeGreaterThan(
        0
      );
      expect(enemy.hp, `${key} hp should equal maxHp`).toBe(enemy.maxHp);
      expect(
        enemy.attack,
        `${key} attack should be positive`
      ).toBeGreaterThan(0);
      expect(
        enemy.defense,
        `${key} defense should be non-negative`
      ).toBeGreaterThanOrEqual(0);
      expect(
        enemy.speed,
        `${key} speed should be positive`
      ).toBeGreaterThan(0);
      expect(enemy.exp, `${key} exp should be positive`).toBeGreaterThan(0);
      expect(enemy.gold, `${key} gold should be positive`).toBeGreaterThan(0);
      expect(enemy.skills, `${key} skills should be array`).toBeInstanceOf(
        Array
      );
      expect(enemy.drops, `${key} drops should be array`).toBeInstanceOf(
        Array
      );
      expect(enemy.sprite, `${key} missing sprite`).toBeTruthy();
    }
  });

  it("enemy drops reference valid items", () => {
    for (const [key, enemy] of Object.entries(ENEMIES)) {
      for (const drop of enemy.drops) {
        expect(
          ITEMS[drop.itemId],
          `${key} drop references invalid item: ${drop.itemId}`
        ).toBeDefined();
        expect(drop.rate, `${key} drop rate should be 0-1`).toBeGreaterThan(
          0
        );
        expect(
          drop.rate,
          `${key} drop rate should be 0-1`
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("Quests data integrity", () => {
  it("all quests have required fields", () => {
    for (const [key, quest] of Object.entries(QUESTS)) {
      expect(quest.id, `${key} missing id`).toBe(key);
      expect(quest.title, `${key} missing title`).toBeTruthy();
      expect(quest.description, `${key} missing description`).toBeTruthy();
      expect(quest.type, `${key} invalid type`).toMatch(/^(main|sub)$/);
      expect(
        quest.chapter,
        `${key} chapter should be positive`
      ).toBeGreaterThan(0);
      expect(
        quest.objectives.length,
        `${key} should have objectives`
      ).toBeGreaterThan(0);
    }
  });

  it("all quest objectives have valid structure", () => {
    for (const [key, quest] of Object.entries(QUESTS)) {
      for (const obj of quest.objectives) {
        expect(obj.id, `${key} objective missing id`).toBeTruthy();
        expect(
          obj.description,
          `${key} objective missing description`
        ).toBeTruthy();
        expect(obj.type, `${key} objective invalid type`).toMatch(
          /^(talk|defeat|collect|reach)$/
        );
        expect(obj.targetId, `${key} objective missing targetId`).toBeTruthy();
        expect(
          obj.targetCount,
          `${key} objective targetCount should be positive`
        ).toBeGreaterThan(0);
        expect(
          obj.currentCount,
          `${key} objective currentCount should be 0`
        ).toBe(0);
        expect(
          obj.completed,
          `${key} objective should start not completed`
        ).toBe(false);
      }
    }
  });

  it("quest rewards have valid structure", () => {
    for (const [key, quest] of Object.entries(QUESTS)) {
      expect(
        quest.rewards.exp,
        `${key} reward exp should be non-negative`
      ).toBeGreaterThanOrEqual(0);
      expect(
        quest.rewards.gold,
        `${key} reward gold should be non-negative`
      ).toBeGreaterThanOrEqual(0);
      expect(
        quest.rewards.items,
        `${key} reward items should be array`
      ).toBeInstanceOf(Array);
      expect(
        quest.rewards.socialPoints,
        `${key} reward socialPoints should be non-negative`
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it("prerequisite quests reference existing quests", () => {
    for (const [key, quest] of Object.entries(QUESTS)) {
      if (quest.prerequisiteQuestId) {
        expect(
          QUESTS[quest.prerequisiteQuestId],
          `${key} references invalid prerequisite: ${quest.prerequisiteQuestId}`
        ).toBeDefined();
      }
    }
  });
});

describe("Skills data integrity", () => {
  it("all skills have required fields", () => {
    for (const [key, skill] of Object.entries(SKILLS)) {
      expect(skill.id, `${key} missing id`).toBe(key);
      expect(skill.name, `${key} missing name`).toBeTruthy();
      expect(skill.description, `${key} missing description`).toBeTruthy();
      expect(
        skill.mpCost,
        `${key} mpCost should be non-negative`
      ).toBeGreaterThanOrEqual(0);
      expect(
        skill.power,
        `${key} power should be positive`
      ).toBeGreaterThan(0);
      expect(skill.type, `${key} invalid type`).toMatch(
        /^(attack|heal|buff|debuff)$/
      );
      expect(skill.target, `${key} invalid target`).toMatch(
        /^(single|all)$/
      );
    }
  });
});

describe("Maps data integrity", () => {
  it("all maps have required fields", () => {
    for (const [key, map] of Object.entries(MAPS)) {
      expect(map.id, `${key} missing id`).toBe(key);
      expect(map.name, `${key} missing name`).toBeTruthy();
      expect(map.width, `${key} width should be positive`).toBeGreaterThan(0);
      expect(map.height, `${key} height should be positive`).toBeGreaterThan(
        0
      );
      expect(map.tiles, `${key} missing tiles`).toBeInstanceOf(Array);
      expect(map.npcs, `${key} npcs should be array`).toBeInstanceOf(Array);
      expect(map.enemies, `${key} enemies should be array`).toBeInstanceOf(
        Array
      );
      expect(map.bgm, `${key} missing bgm`).toBeTruthy();
    }
  });

  it("map dimensions match tiles array", () => {
    for (const [key, map] of Object.entries(MAPS)) {
      expect(
        map.tiles.length,
        `${key} tiles height mismatch: expected ${map.height}, got ${map.tiles.length}`
      ).toBe(map.height);
      for (let y = 0; y < map.tiles.length; y++) {
        expect(
          map.tiles[y].length,
          `${key} tiles width mismatch at row ${y}: expected ${map.width}, got ${map.tiles[y].length}`
        ).toBe(map.width);
      }
    }
  });

  it("map enemies reference valid enemy ids", () => {
    for (const [key, map] of Object.entries(MAPS)) {
      for (const enemyId of map.enemies) {
        expect(
          ENEMIES[enemyId],
          `${key} references invalid enemy: ${enemyId}`
        ).toBeDefined();
      }
    }
  });
});
