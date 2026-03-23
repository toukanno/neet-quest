import { create } from "zustand";
import type {
  Character,
  Enemy,
  BattleState,
  Position,
  SaveData,
  QuestObjective,
  Dialogue,
  GameSettings,
} from "@/types/game";
import { ITEMS } from "@/data/items";
import { SKILLS } from "@/data/skills";
import { QUESTS } from "@/data/quests";
import { MAPS } from "@/data/maps";
import { ENEMIES } from "@/data/enemies";
import { ACHIEVEMENTS } from "@/data/achievements";
import { SHOPS } from "@/data/shops";
import { chooseEnemyAction } from "@/data/enemyAI";
import type { GameTime, RandomEvent } from "@/data/events";
import { advanceTime, checkRandomEvent } from "@/data/events";
import { getSocialRank } from "@/data/endings";
import type { Ending } from "@/data/endings";
import { getEnding } from "@/data/endings";

interface InventoryItem {
  itemId: string;
  count: number;
}

interface GameState {
  // Player
  player: Character;
  party: Character[];
  inventory: InventoryItem[];
  gold: number;
  socialPoints: number;

  // Map
  currentMapId: string;
  playerPosition: Position;

  // Quests
  activeQuests: string[];
  completedQuests: string[];

  // Battle
  battle: BattleState | null;

  // Dialogue
  currentDialogue: Dialogue | null;
  currentNpcId: string | null;

  // Time
  gameTime: GameTime;

  // Events
  currentEvent: RandomEvent | null;

  // Ending
  currentEnding: Ending | null;

  // Meta
  chapter: number;
  playTime: number;
  gameStarted: boolean;

  // Time
  day: number;

  // Achievements
  unlockedAchievements: string[];
  lastAchievement: string | null;

  // Stats tracking
  enemiesDefeated: number;
  mapsVisited: string[];
  itemsCollected: string[];

  // Settings
  settings: GameSettings;

  // Shop
  currentShopId: string | null;
  shopStock: Record<string, Record<string, number>>;

  // Quest progress (cloned from QUESTS to avoid mutation)
  questProgress: Record<string, QuestObjective[]>;

  // Tutorial
  tutorialStep: number;

  // Actions - Player
  initNewGame: () => void;
  gainExp: (amount: number) => void;
  takeDamage: (amount: number) => void;
  healHp: (amount: number) => void;
  healMp: (amount: number) => void;

  // Actions - Inventory
  addItem: (itemId: string, count?: number) => void;
  removeItem: (itemId: string, count?: number) => void;
  useItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  addGold: (amount: number) => void;

  // Actions - Map
  movePlayer: (direction: "up" | "down" | "left" | "right") => void;
  changeMap: (mapId: string, position: Position) => void;
  interact: () => void;

  // Actions - Quest
  acceptQuest: (questId: string) => void;
  updateQuestProgress: (type: QuestObjective["type"], targetId: string) => void;
  completeQuest: (questId: string) => void;

  // Actions - Battle
  startBattle: (enemyIds: string[]) => void;
  playerAttack: (targetIndex: number) => void;
  playerSkill: (skillId: string, targetIndex: number) => void;
  playerUseItem: (itemId: string) => void;
  playerFlee: () => boolean;
  enemyTurn: () => void;
  endBattle: () => void;

  // Actions - Dialogue
  startDialogue: (npcId: string) => void;
  advanceDialogue: (choiceIndex?: number) => void;
  endDialogue: () => void;

  // Actions - Save/Load
  saveGame: (slotId: string) => void;
  loadGame: (slotId: string) => boolean;
  getSaveSlots: () => (SaveData | null)[];

  // Actions - Social Points
  addSocialPoints: (amount: number) => void;

  // Actions - Time
  advanceDay: () => void;

  // Actions - Achievements
  checkAchievements: () => void;
  dismissAchievement: () => void;

  // Actions - Settings
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Actions - Shop
  openShop: (shopId: string) => void;
  closeShop: () => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;

  // Actions - Tutorial
  advanceTutorial: () => void;
  skipTutorial: () => void;

  // Actions - Events
  dismissEvent: () => void;

  // Actions - Ending
  checkEnding: () => void;
  dismissEnding: () => void;

  // Getters
  getSocialRank: () => string;
}

function createDefaultPlayer(): Character {
  return {
    id: "player",
    name: "ニート",
    level: 1,
    hp: 50,
    maxHp: 50,
    mp: 20,
    maxMp: 20,
    attack: 8,
    defense: 5,
    speed: 5,
    exp: 0,
    expToNext: 30,
    skills: [SKILLS.slash, SKILLS.heal],
    equipment: { weapon: null, armor: null, accessory: null },
    sprite: "hero",
  };
}

function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem("neetquest_settings");
    if (saved) return JSON.parse(saved);
  } catch {
    /* use defaults */
  }
  return {
    bgmVolume: 70,
    seVolume: 80,
    textSpeed: "normal",
    showTutorial: true,
  };
}

function cloneQuestProgress(): Record<string, QuestObjective[]> {
  const progress: Record<string, QuestObjective[]> = {};
  for (const [id, quest] of Object.entries(QUESTS)) {
    progress[id] = quest.objectives.map((o) => ({ ...o }));
  }
  return progress;
}

function initShopStock(): Record<string, Record<string, number>> {
  const stock: Record<string, Record<string, number>> = {};
  for (const [shopId, shop] of Object.entries(SHOPS)) {
    stock[shopId] = {};
    for (const si of shop.inventory) {
      stock[shopId][si.itemId] = si.stock;
    }
  }
  return stock;
}

function calcExpToNext(level: number): number {
  return Math.floor(30 * Math.pow(1.3, level - 1));
}

function calcDamage(atk: number, def: number): number {
  const base = Math.max(1, atk - def / 2);
  const variance = 0.8 + Math.random() * 0.4;
  return Math.floor(base * variance);
}

export const useGameStore = create<GameState>((set, get) => ({
  player: createDefaultPlayer(),
  party: [],
  inventory: [
    { itemId: "cup_noodle", count: 3 },
    { itemId: "wooden_sword", count: 1 },
    { itemId: "hoodie", count: 1 },
  ],
  gold: 100,
  socialPoints: 0,
  currentMapId: "my_room",
  playerPosition: { x: 3, y: 3 },
  activeQuests: ["main_1"],
  completedQuests: [],
  battle: null,
  currentDialogue: null,
  currentNpcId: null,
  gameTime: { day: 1, timeOfDay: "morning", totalSteps: 0 },
  currentEvent: null,
  currentEnding: null,
  chapter: 1,
  playTime: 0,
  gameStarted: false,
  day: 1,
  unlockedAchievements: [],
  lastAchievement: null,
  enemiesDefeated: 0,
  mapsVisited: ["my_room"],
  itemsCollected: ["cup_noodle", "wooden_sword", "hoodie"],
  settings: loadSettings(),
  currentShopId: null,
  shopStock: initShopStock(),
  questProgress: cloneQuestProgress(),
  tutorialStep: 0,

  initNewGame: () => {
    const showTutorial = get().settings.showTutorial;
    set({
      player: createDefaultPlayer(),
      party: [],
      inventory: [
        { itemId: "cup_noodle", count: 3 },
        { itemId: "wooden_sword", count: 1 },
        { itemId: "hoodie", count: 1 },
      ],
      gold: 100,
      socialPoints: 0,
      currentMapId: "my_room",
      playerPosition: { x: 3, y: 3 },
      activeQuests: ["main_1"],
      completedQuests: [],
      battle: null,
      currentDialogue: null,
      currentNpcId: null,
      gameTime: { day: 1, timeOfDay: "morning", totalSteps: 0 },
      currentEvent: null,
      currentEnding: null,
      chapter: 1,
      playTime: 0,
      gameStarted: true,
      day: 1,
      unlockedAchievements: [],
      lastAchievement: null,
      enemiesDefeated: 0,
      mapsVisited: ["my_room"],
      itemsCollected: ["cup_noodle", "wooden_sword", "hoodie"],
      currentShopId: null,
      shopStock: initShopStock(),
      questProgress: cloneQuestProgress(),
      tutorialStep: showTutorial ? 1 : 0,
    });
  },

  gainExp: (amount) => {
    set((state) => {
      let { level, exp, expToNext, maxHp, maxMp, attack, defense, speed } =
        state.player;
      exp += amount;
      while (exp >= expToNext) {
        exp -= expToNext;
        level++;
        expToNext = calcExpToNext(level);
        maxHp += 8;
        maxMp += 4;
        attack += 2;
        defense += 2;
        speed += 1;
      }
      return {
        player: {
          ...state.player,
          level,
          exp,
          expToNext,
          hp: level > state.player.level ? maxHp : state.player.hp,
          maxHp,
          mp: level > state.player.level ? maxMp : state.player.mp,
          maxMp,
          attack,
          defense,
          speed,
        },
      };
    });
    get().checkAchievements();
  },

  takeDamage: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        hp: Math.max(0, state.player.hp - amount),
      },
    })),

  healHp: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        hp: Math.min(state.player.maxHp, state.player.hp + amount),
      },
    })),

  healMp: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        mp: Math.min(state.player.maxMp, state.player.mp + amount),
      },
    })),

  addItem: (itemId, count = 1) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.itemId === itemId);
      const newCollected = state.itemsCollected.includes(itemId)
        ? state.itemsCollected
        : [...state.itemsCollected, itemId];
      if (existing) {
        return {
          inventory: state.inventory.map((i) =>
            i.itemId === itemId ? { ...i, count: i.count + count } : i,
          ),
          itemsCollected: newCollected,
        };
      }
      return {
        inventory: [...state.inventory, { itemId, count }],
        itemsCollected: newCollected,
      };
    }),

  removeItem: (itemId, count = 1) =>
    set((state) => {
      return {
        inventory: state.inventory
          .map((i) =>
            i.itemId === itemId ? { ...i, count: i.count - count } : i,
          )
          .filter((i) => i.count > 0),
      };
    }),

  useItem: (itemId) => {
    const item = ITEMS[itemId];
    if (!item || !item.effect) return;
    const state = get();
    const inInventory = state.inventory.find((i) => i.itemId === itemId);
    if (!inInventory || inInventory.count <= 0) return;

    switch (item.effect.type) {
      case "heal_hp":
        state.healHp(item.effect.value);
        break;
      case "heal_mp":
        state.healMp(item.effect.value);
        break;
      case "buff_attack":
        set((s) => ({
          player: { ...s.player, attack: s.player.attack + item.effect!.value },
        }));
        break;
      case "buff_defense":
        set((s) => ({
          player: {
            ...s.player,
            defense: s.player.defense + item.effect!.value,
          },
        }));
        break;
    }
    state.removeItem(itemId);
  },

  equipItem: (itemId) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== "equipment" || !item.equipSlot) return;
    set((state) => {
      const oldEquip = state.player.equipment[item.equipSlot!];
      let { attack, defense, speed } = state.player;

      if (oldEquip?.stats) {
        attack -= oldEquip.stats.attack ?? 0;
        defense -= oldEquip.stats.defense ?? 0;
        speed -= oldEquip.stats.speed ?? 0;
      }
      if (item.stats) {
        attack += item.stats.attack ?? 0;
        defense += item.stats.defense ?? 0;
        speed += item.stats.speed ?? 0;
      }

      const withoutEquipped = state.inventory
        .map((i) => (i.itemId === itemId ? { ...i, count: i.count - 1 } : i))
        .filter((i) => i.count > 0);
      const newInventory = oldEquip
        ? [...withoutEquipped, { itemId: oldEquip.id, count: 1 }]
        : withoutEquipped;

      return {
        player: {
          ...state.player,
          attack,
          defense,
          speed,
          equipment: { ...state.player.equipment, [item.equipSlot!]: item },
        },
        inventory: newInventory,
      };
    });
  },

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),

  movePlayer: (direction) =>
    set((state) => {
      const map = MAPS[state.currentMapId];
      if (!map) return state;
      const { x, y } = state.playerPosition;
      let nx = x,
        ny = y;
      switch (direction) {
        case "up":
          ny = y - 1;
          break;
        case "down":
          ny = y + 1;
          break;
        case "left":
          nx = x - 1;
          break;
        case "right":
          nx = x + 1;
          break;
      }
      if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) return state;
      const targetTile = map.tiles[ny][nx];
      if (!targetTile.passable) return state;

      // Random encounter
      if (
        targetTile.type === "floor" &&
        map.enemies.length > 0 &&
        Math.random() < 0.12
      ) {
        const enemyId =
          map.enemies[Math.floor(Math.random() * map.enemies.length)];
        const count = 1 + Math.floor(Math.random() * 3);
        const enemyIds = Array(count).fill(enemyId);
        setTimeout(() => get().startBattle(enemyIds), 100);
      }

      // Advance game time
      const newGameTime = advanceTime(state.gameTime);

      // Check for random events
      const eventContext = {
        day: newGameTime.day,
        timeOfDay: newGameTime.timeOfDay,
        socialPoints: state.socialPoints,
        currentMapId: state.currentMapId,
        chapter: state.chapter,
        playerLevel: state.player.level,
      };
      const event = checkRandomEvent(eventContext);
      if (event) {
        setTimeout(() => set({ currentEvent: event }), 200);
      }

      return { playerPosition: { x: nx, y: ny }, gameTime: newGameTime };
    }),

  changeMap: (mapId, position) => {
    const current = get();
    const isNewMap = !current.mapsVisited.includes(mapId);
    set((state) => ({
      currentMapId: mapId,
      playerPosition: position,
      mapsVisited: isNewMap ? [...state.mapsVisited, mapId] : state.mapsVisited,
    }));
    if (isNewMap) {
      get().advanceDay();
    }
    get().checkAchievements();
  },

  interact: () => {
    const state = get();
    const map = MAPS[state.currentMapId];
    if (!map) return;

    // Check adjacent tiles for interactables
    const { x, y } = state.playerPosition;
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];
    for (const { dx, dy } of directions) {
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) continue;
      const tile = map.tiles[ty][tx];

      if (tile.type === "npc" && tile.entityId) {
        state.startDialogue(tile.entityId);
        return;
      }
      if (tile.type === "exit" && tile.entityId) {
        const targetMapId = tile.entityId;
        const targetMap = MAPS[targetMapId];
        if (targetMap) {
          // Find entrance position in target map
          let entrance: Position = { x: 1, y: 1 };
          for (let my = 0; my < targetMap.height; my++) {
            for (let mx = 0; mx < targetMap.width; mx++) {
              const t = targetMap.tiles[my][mx];
              if (t.type === "exit" && t.entityId === state.currentMapId) {
                // Place player adjacent to the exit
                if (my > 0 && targetMap.tiles[my - 1][mx].passable)
                  entrance = { x: mx, y: my - 1 };
                else if (
                  my < targetMap.height - 1 &&
                  targetMap.tiles[my + 1][mx].passable
                )
                  entrance = { x: mx, y: my + 1 };
                else if (mx > 0 && targetMap.tiles[my][mx - 1].passable)
                  entrance = { x: mx - 1, y: my };
                else if (
                  mx < targetMap.width - 1 &&
                  targetMap.tiles[my][mx + 1].passable
                )
                  entrance = { x: mx + 1, y: my };
              }
            }
          }
          state.changeMap(targetMapId, entrance);
          state.updateQuestProgress("reach", targetMapId);
        }
        return;
      }
      if (tile.type === "door" && tile.entityId) {
        state.updateQuestProgress("reach", tile.entityId);
        return;
      }
    }
    // Also check current tile
    const currentTile = map.tiles[y][x];
    if (currentTile.type === "exit" && currentTile.entityId) {
      const targetMapId = currentTile.entityId;
      const targetMap = MAPS[targetMapId];
      if (targetMap) {
        let entrance: Position = { x: 1, y: 1 };
        for (let my = 0; my < targetMap.height; my++) {
          for (let mx = 0; mx < targetMap.width; mx++) {
            const t = targetMap.tiles[my][mx];
            if (t.type === "exit" && t.entityId === state.currentMapId) {
              if (my > 0 && targetMap.tiles[my - 1][mx].passable)
                entrance = { x: mx, y: my - 1 };
              else if (
                my < targetMap.height - 1 &&
                targetMap.tiles[my + 1][mx].passable
              )
                entrance = { x: mx, y: my + 1 };
            }
          }
        }
        state.changeMap(targetMapId, entrance);
        state.updateQuestProgress("reach", targetMapId);
      }
    }
  },

  acceptQuest: (questId) =>
    set((state) => {
      if (state.activeQuests.includes(questId)) return state;
      const quest = QUESTS[questId];
      if (!quest) return state;
      if (
        quest.prerequisiteQuestId &&
        !state.completedQuests.includes(quest.prerequisiteQuestId)
      )
        return state;
      return { activeQuests: [...state.activeQuests, questId] };
    }),

  updateQuestProgress: (type, targetId) =>
    set((state) => {
      let questCompleted: string | null = null;
      const activeQuests = state.activeQuests;
      const newProgress = { ...state.questProgress };

      for (const questId of activeQuests) {
        const objectives = newProgress[questId];
        if (!objectives) continue;
        newProgress[questId] = objectives.map((obj) => {
          if (
            obj.type === type &&
            obj.targetId === targetId &&
            !obj.completed
          ) {
            const newCount = obj.currentCount + 1;
            return {
              ...obj,
              currentCount: newCount,
              completed: newCount >= obj.targetCount,
            };
          }
          return obj;
        });
        if (newProgress[questId].every((o) => o.completed)) {
          questCompleted = questId;
        }
      }

      if (questCompleted) {
        setTimeout(() => get().completeQuest(questCompleted!), 500);
      }

      return { questProgress: newProgress };
    }),

  completeQuest: (questId) => {
    const quest = QUESTS[questId];
    if (!quest) return;
    const state = get();
    state.gainExp(quest.rewards.exp);
    state.addGold(quest.rewards.gold);
    state.addSocialPoints(quest.rewards.socialPoints);
    for (const itemId of quest.rewards.items) {
      state.addItem(itemId);
    }
    set((s) => ({
      completedQuests: [...s.completedQuests, questId],
      activeQuests: s.activeQuests.filter((id) => id !== questId),
    }));
    state.advanceDay();
    // Auto-accept next quests
    for (const [id, q] of Object.entries(QUESTS)) {
      if (
        q.prerequisiteQuestId === questId &&
        !state.activeQuests.includes(id)
      ) {
        state.acceptQuest(id);
      }
    }
    state.checkAchievements();
  },

  startBattle: (enemyIds) =>
    set(() => {
      const enemies: Enemy[] = enemyIds.map((id, i) => ({
        ...ENEMIES[id],
        id: `${id}_${i}`,
        hp: ENEMIES[id].maxHp,
      }));
      return {
        battle: {
          phase: "start",
          enemies,
          turnOrder: [],
          currentTurn: 0,
          log: [`${enemies.map((e) => e.name).join("と")}が現れた！`],
        },
      };
    }),

  playerAttack: (targetIndex) =>
    set((state) => {
      if (!state.battle) return state;
      const enemies = [...state.battle.enemies];
      const target = { ...enemies[targetIndex] };
      const damage = calcDamage(state.player.attack, target.defense);
      target.hp = Math.max(0, target.hp - damage);
      enemies[targetIndex] = target;

      const log = [
        ...state.battle.log,
        `${state.player.name}の攻撃！${target.name}に${damage}のダメージ！`,
      ];

      if (target.hp <= 0) {
        log.push(`${target.name}を倒した！`);
        state.updateQuestProgress("defeat", target.id.replace(/_\d+$/, ""));
      }

      const aliveEnemies = enemies.filter((e) => e.hp > 0);
      if (aliveEnemies.length === 0) {
        const totalExp = state.battle.enemies.reduce((s, e) => s + e.exp, 0);
        const totalGold = state.battle.enemies.reduce((s, e) => s + e.gold, 0);
        log.push(`勝利！${totalExp}EXP と ${totalGold}G を獲得！`);
        const battleEnemies = state.battle.enemies;
        setTimeout(() => {
          if (!get().battle) return;
          const st = get();
          st.gainExp(totalExp);
          st.addGold(totalGold);
          set((s) => ({
            enemiesDefeated: s.enemiesDefeated + battleEnemies.length,
          }));
          for (const enemy of battleEnemies) {
            for (const drop of enemy.drops) {
              if (Math.random() < drop.rate) {
                st.addItem(drop.itemId);
                const item = ITEMS[drop.itemId];
                if (item) {
                  set((s) => ({
                    battle: s.battle
                      ? {
                          ...s.battle,
                          log: [...s.battle.log, `${item.name}を手に入れた！`],
                        }
                      : null,
                  }));
                }
              }
            }
          }
          st.checkAchievements();
        }, 100);
        return {
          battle: { ...state.battle, enemies, log, phase: "victory" },
        };
      }

      // Trigger enemy turn after short delay
      setTimeout(() => {
        if (get().battle) get().enemyTurn();
      }, 800);
      return {
        battle: { ...state.battle, enemies, log, phase: "enemy_turn" },
      };
    }),

  playerSkill: (skillId, targetIndex) =>
    set((state) => {
      if (!state.battle) return state;
      const skill = state.player.skills.find((s) => s.id === skillId);
      if (!skill || state.player.mp < skill.mpCost) return state;

      const newPlayer = { ...state.player, mp: state.player.mp - skill.mpCost };
      const enemies = [...state.battle.enemies];
      const log = [...state.battle.log];

      if (skill.type === "heal") {
        const healAmount = skill.power;
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
        log.push(
          `${newPlayer.name}は${skill.name}を使った！HPが${healAmount}回復！`,
        );
      } else if (skill.type === "attack") {
        if (skill.target === "all") {
          const logLenBefore = log.length;
          for (let i = 0; i < enemies.length; i++) {
            if (enemies[i].hp <= 0) continue;
            const damage = calcDamage(
              state.player.attack + skill.power,
              enemies[i].defense,
            );
            enemies[i] = {
              ...enemies[i],
              hp: Math.max(0, enemies[i].hp - damage),
            };
            log.push(`${enemies[i].name}に${damage}のダメージ！`);
            if (enemies[i].hp <= 0) {
              log.push(`${enemies[i].name}を倒した！`);
              state.updateQuestProgress(
                "defeat",
                enemies[i].id.replace(/_\d+$/, ""),
              );
            }
          }
          log.splice(
            logLenBefore,
            0,
            `${newPlayer.name}は${skill.name}を放った！`,
          );
        } else {
          const target = { ...enemies[targetIndex] };
          const damage = calcDamage(
            state.player.attack + skill.power,
            target.defense,
          );
          target.hp = Math.max(0, target.hp - damage);
          enemies[targetIndex] = target;
          log.push(
            `${newPlayer.name}は${skill.name}を使った！${target.name}に${damage}のダメージ！`,
          );
          if (target.hp <= 0) {
            log.push(`${target.name}を倒した！`);
            state.updateQuestProgress("defeat", target.id.replace(/_\d+$/, ""));
          }
        }
      }

      const aliveEnemies = enemies.filter((e) => e.hp > 0);
      if (aliveEnemies.length === 0) {
        const totalExp = state.battle.enemies.reduce((s, e) => s + e.exp, 0);
        const totalGold = state.battle.enemies.reduce((s, e) => s + e.gold, 0);
        log.push(`勝利！${totalExp}EXP と ${totalGold}G を獲得！`);
        setTimeout(() => {
          const st = get();
          if (!st.battle) return;
          st.gainExp(totalExp);
          st.addGold(totalGold);
          set((s) => ({
            enemiesDefeated: s.enemiesDefeated + state.battle!.enemies.length,
          }));
          for (const enemy of state.battle!.enemies) {
            for (const drop of enemy.drops) {
              if (Math.random() < drop.rate) {
                st.addItem(drop.itemId);
                const dropItem = ITEMS[drop.itemId];
                if (dropItem) {
                  set((s) => ({
                    battle: s.battle
                      ? {
                          ...s.battle,
                          log: [
                            ...s.battle.log,
                            `${dropItem.name}を手に入れた！`,
                          ],
                        }
                      : null,
                  }));
                }
              }
            }
          }
          st.checkAchievements();
        }, 100);
        return {
          player: newPlayer,
          battle: { ...state.battle, enemies, log, phase: "victory" },
        };
      }

      setTimeout(() => {
        if (get().battle) get().enemyTurn();
      }, 800);
      return {
        player: newPlayer,
        battle: { ...state.battle, enemies, log, phase: "enemy_turn" },
      };
    }),

  playerUseItem: (itemId) => {
    const state = get();
    if (!state.battle) return;
    state.useItem(itemId);
    const item = ITEMS[itemId];
    if (item) {
      set((s) => ({
        battle: s.battle
          ? {
              ...s.battle,
              log: [...s.battle.log, `${item.name}を使った！`],
              phase: "enemy_turn" as const,
            }
          : null,
      }));
      setTimeout(() => {
        if (get().battle) get().enemyTurn();
      }, 800);
    }
  },

  playerFlee: () => {
    const success = Math.random() < 0.5;
    if (success) {
      set((state) => ({
        battle: state.battle
          ? {
              ...state.battle,
              log: [...state.battle.log, "うまく逃げ出した！"],
              phase: "victory",
            }
          : null,
      }));
      return true;
    }
    set((state) => ({
      battle: state.battle
        ? {
            ...state.battle,
            log: [...state.battle.log, "逃げられなかった！"],
            phase: "enemy_turn",
          }
        : null,
    }));
    setTimeout(() => {
      if (get().battle) get().enemyTurn();
    }, 800);
    return false;
  },

  enemyTurn: () =>
    set((state) => {
      if (!state.battle) return state;
      const enemies = [...state.battle.enemies];
      const log = [...state.battle.log];
      let playerHp = state.player.hp;
      let playerDef = state.player.defense;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.hp <= 0) continue;

        const playerSnapshot = { hp: playerHp, maxHp: state.player.maxHp, defense: playerDef };
        const action = chooseEnemyAction(enemy, playerSnapshot, {
          turnCount: state.battle.currentTurn,
          currentHp: enemy.hp,
          maxHp: enemy.maxHp,
        });

        if (action.type === "skill" && action.skillId) {
          const skill = enemy.skills.find((s) => s.id === action.skillId);
          if (skill) {
            if (skill.type === "attack") {
              const damage = calcDamage(enemy.attack + skill.power, playerDef);
              playerHp = Math.max(0, playerHp - damage);
              log.push(`${enemy.name}の${skill.name}！${state.player.name}に${damage}のダメージ！`);
            } else if (skill.type === "debuff") {
              playerDef = Math.max(0, playerDef - skill.power);
              log.push(`${enemy.name}の${skill.name}！${state.player.name}の防御力が${skill.power}下がった！`);
            } else if (skill.type === "buff") {
              enemies[i] = { ...enemy, attack: enemy.attack + skill.power };
              log.push(`${enemy.name}の${skill.name}！${enemy.name}の攻撃力が上がった！`);
            } else if (skill.type === "heal") {
              const healAmount = Math.min(skill.power, enemy.maxHp - enemy.hp);
              enemies[i] = { ...enemy, hp: enemy.hp + healAmount };
              log.push(`${enemy.name}の${skill.name}！HPが${healAmount}回復した！`);
            }
          } else {
            // Skill not found, fallback to basic attack
            const damage = calcDamage(enemy.attack, playerDef);
            playerHp = Math.max(0, playerHp - damage);
            log.push(`${enemy.name}の攻撃！${state.player.name}に${damage}のダメージ！`);
          }
        } else {
          const damage = calcDamage(enemy.attack, playerDef);
          playerHp = Math.max(0, playerHp - damage);
          log.push(`${enemy.name}の攻撃！${state.player.name}に${damage}のダメージ！`);
        }
      }

      if (playerHp <= 0) {
        log.push(`${state.player.name}は力尽きた...`);
        return {
          player: { ...state.player, hp: 0, defense: playerDef },
          battle: { ...state.battle, enemies, log, phase: "defeat", currentTurn: state.battle.currentTurn + 1 },
        };
      }

      return {
        player: { ...state.player, hp: playerHp, defense: playerDef },
        battle: { ...state.battle, enemies, log, phase: "player_turn", currentTurn: state.battle.currentTurn + 1 },
      };
    }),

  endBattle: () => set({ battle: null }),

  startDialogue: (npcId) => {
    const map = MAPS[get().currentMapId];
    if (!map) return;
    const npc = map.npcs.find((n) => n.id === npcId);
    if (!npc || npc.dialogues.length === 0) return;
    set({ currentDialogue: npc.dialogues[0], currentNpcId: npcId });
    get().updateQuestProgress("talk", npcId);
  },

  advanceDialogue: (choiceIndex) =>
    set((state) => {
      if (!state.currentDialogue || !state.currentNpcId) return state;
      const map = MAPS[state.currentMapId];
      if (!map) return state;
      const npc = map.npcs.find((n) => n.id === state.currentNpcId);
      if (!npc) return state;

      if (state.currentDialogue.choices && choiceIndex !== undefined) {
        const choice = state.currentDialogue.choices[choiceIndex];
        if (choice) {
          const nextDialogue = npc.dialogues.find(
            (d) => d.id === choice.nextDialogueId,
          );
          if (nextDialogue) {
            return { currentDialogue: nextDialogue };
          }
        }
      }
      return { currentDialogue: null, currentNpcId: null };
    }),

  endDialogue: () => set({ currentDialogue: null, currentNpcId: null }),

  saveGame: (slotId) => {
    const state = get();
    const saveData: SaveData = {
      id: slotId,
      timestamp: Date.now(),
      player: state.player,
      party: state.party,
      inventory: state.inventory,
      gold: state.gold,
      socialPoints: state.socialPoints,
      completedQuests: state.completedQuests,
      activeQuests: state.activeQuests,
      currentMapId: state.currentMapId,
      playerPosition: state.playerPosition,
      playTime: state.playTime,
      chapter: state.chapter,
      day: state.day,
      unlockedAchievements: state.unlockedAchievements,
      enemiesDefeated: state.enemiesDefeated,
      mapsVisited: state.mapsVisited,
      itemsCollected: state.itemsCollected,
      questProgress: state.questProgress,
      shopStock: state.shopStock,
      gameTime: state.gameTime,
    };
    localStorage.setItem(`neetquest_save_${slotId}`, JSON.stringify(saveData));
  },

  loadGame: (slotId) => {
    const data = localStorage.getItem(`neetquest_save_${slotId}`);
    if (!data) return false;
    const saveData: SaveData = JSON.parse(data);
    set({
      player: saveData.player,
      party: saveData.party,
      inventory: saveData.inventory,
      gold: saveData.gold,
      socialPoints: saveData.socialPoints,
      completedQuests: saveData.completedQuests,
      activeQuests: saveData.activeQuests,
      currentMapId: saveData.currentMapId,
      playerPosition: saveData.playerPosition,
      playTime: saveData.playTime,
      chapter: saveData.chapter,
      day: saveData.day ?? 1,
      unlockedAchievements: saveData.unlockedAchievements ?? [],
      enemiesDefeated: saveData.enemiesDefeated ?? 0,
      mapsVisited: saveData.mapsVisited ?? ["my_room"],
      itemsCollected: saveData.itemsCollected ?? [],
      questProgress: saveData.questProgress ?? cloneQuestProgress(),
      shopStock: saveData.shopStock ?? initShopStock(),
      gameTime: saveData.gameTime ?? { day: 1, timeOfDay: "morning" as const, totalSteps: 0 },
      gameStarted: true,
      battle: null,
      currentDialogue: null,
      currentNpcId: null,
      currentEvent: null,
      currentEnding: null,
    });
    return true;
  },

  getSaveSlots: () => {
    return [1, 2, 3].map((i) => {
      const data = localStorage.getItem(`neetquest_save_${i}`);
      return data ? JSON.parse(data) : null;
    });
  },

  addSocialPoints: (amount) =>
    set((state) => ({ socialPoints: state.socialPoints + amount })),

  // Time
  advanceDay: () => set((state) => ({ day: state.day + 1 })),

  // Achievements
  checkAchievements: () => {
    const state = get();
    const newUnlocked: string[] = [];
    for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
      if (state.unlockedAchievements.includes(id)) continue;
      let met = false;
      switch (ach.condition.type) {
        case "level":
          met = state.player.level >= ach.condition.value;
          break;
        case "social_points":
          met = state.socialPoints >= ach.condition.value;
          break;
        case "gold":
          met = state.gold >= ach.condition.value;
          break;
        case "quests_completed":
          met = state.completedQuests.length >= ach.condition.value;
          break;
        case "enemies_defeated":
          met = state.enemiesDefeated >= ach.condition.value;
          break;
        case "maps_visited":
          met = state.mapsVisited.length >= ach.condition.value;
          break;
        case "items_collected":
          met = state.itemsCollected.length >= ach.condition.value;
          break;
      }
      if (met) newUnlocked.push(id);
    }
    if (newUnlocked.length > 0) {
      set((s) => ({
        unlockedAchievements: [...s.unlockedAchievements, ...newUnlocked],
        lastAchievement: newUnlocked[newUnlocked.length - 1],
      }));
    }
  },

  dismissAchievement: () => set({ lastAchievement: null }),

  // Settings
  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    localStorage.setItem("neetquest_settings", JSON.stringify(newSettings));
  },

  // Shop
  openShop: (shopId) => set({ currentShopId: shopId }),
  closeShop: () => set({ currentShopId: null }),

  buyItem: (itemId) => {
    const state = get();
    const item = ITEMS[itemId];
    if (!item || state.gold < item.price) return;
    if (state.currentShopId) {
      const shopId = state.currentShopId;
      const shop = SHOPS[shopId];
      if (!shop) return;
      const shopItem = shop.inventory.find((si) => si.itemId === itemId);
      if (!shopItem) return;
      const currentStock = state.shopStock[shopId]?.[itemId] ?? shopItem.stock;
      if (currentStock === 0) return;
      if (currentStock > 0) {
        set((s) => ({
          shopStock: {
            ...s.shopStock,
            [shopId]: {
              ...s.shopStock[shopId],
              [itemId]: currentStock - 1,
            },
          },
        }));
      }
    }
    state.addGold(-item.price);
    state.addItem(itemId);
    state.checkAchievements();
  },

  sellItem: (itemId) => {
    const state = get();
    const item = ITEMS[itemId];
    if (!item || item.type === "key") return;
    const inInventory = state.inventory.find((i) => i.itemId === itemId);
    if (!inInventory || inInventory.count <= 0) return;
    const sellPrice = Math.floor(item.price / 2);
    state.removeItem(itemId);
    state.addGold(sellPrice);
  },

  // Tutorial
  advanceTutorial: () =>
    set((state) => {
      const nextStep = state.tutorialStep + 1;
      if (nextStep > 5) {
        const newSettings = { ...state.settings, showTutorial: false };
        localStorage.setItem("neetquest_settings", JSON.stringify(newSettings));
        return { tutorialStep: 0, settings: newSettings };
      }
      return { tutorialStep: nextStep };
    }),
  skipTutorial: () => {
    const state = get();
    const newSettings = { ...state.settings, showTutorial: false };
    localStorage.setItem("neetquest_settings", JSON.stringify(newSettings));
    set({ tutorialStep: 0, settings: newSettings });
  },

  // Events
  dismissEvent: () => set({ currentEvent: null }),

  // Ending
  checkEnding: () => {
    const state = get();
    const ending = getEnding({
      socialPoints: state.socialPoints,
      completedQuests: state.completedQuests,
      chapter: state.chapter,
      playerLevel: state.player.level,
      partySize: state.party.length,
      day: state.gameTime.day,
    });
    set({ currentEnding: ending });
  },

  dismissEnding: () => set({ currentEnding: null }),

  getSocialRank: () => getSocialRank(get().socialPoints),
}));
