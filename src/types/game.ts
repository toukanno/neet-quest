export interface Character {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  expToNext: number;
  skills: Skill[];
  equipment: Equipment;
  sprite: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  power: number;
  type: "attack" | "heal" | "buff" | "debuff";
  target: "single" | "all";
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: "consumable" | "equipment" | "key";
  effect?: ItemEffect;
  equipSlot?: "weapon" | "armor" | "accessory";
  stats?: Partial<Pick<Character, "attack" | "defense" | "speed">>;
  price: number;
}

export interface ItemEffect {
  type: "heal_hp" | "heal_mp" | "buff_attack" | "buff_defense";
  value: number;
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  skills: Skill[];
  drops: { itemId: string; rate: number }[];
  sprite: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: "main" | "sub";
  chapter: number;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisiteQuestId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: "talk" | "defeat" | "collect" | "reach";
  targetId: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface QuestReward {
  exp: number;
  gold: number;
  items: string[];
  socialPoints: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  dialogues: Dialogue[];
  position: Position;
  sprite: string;
}

export interface Dialogue {
  id: string;
  text: string;
  choices?: DialogueChoice[];
  condition?: string;
}

export interface DialogueChoice {
  text: string;
  nextDialogueId: string;
  effect?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface MapTile {
  type: "floor" | "wall" | "door" | "npc" | "enemy" | "item" | "exit";
  passable: boolean;
  sprite: string;
  entityId?: string;
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: MapTile[][];
  npcs: NPC[];
  enemies: string[];
  bgm: string;
}

export interface BattleState {
  phase: "start" | "player_turn" | "enemy_turn" | "victory" | "defeat";
  enemies: Enemy[];
  turnOrder: string[];
  currentTurn: number;
  log: string[];
}

export interface SaveData {
  id: string;
  timestamp: number;
  player: Character;
  party: Character[];
  inventory: { itemId: string; count: number }[];
  gold: number;
  socialPoints: number;
  completedQuests: string[];
  activeQuests: string[];
  questProgress: Record<string, QuestObjective[]>;
  currentMapId: string;
  playerPosition: Position;
  playTime: number;
  chapter: number;
  day: number;
  unlockedAchievements: string[];
  enemiesDefeated: number;
  mapsVisited: string[];
  itemsCollected: string[];
  shopStock: Record<string, Record<string, number>>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type:
    | "level"
    | "social_points"
    | "gold"
    | "quests_completed"
    | "enemies_defeated"
    | "maps_visited"
    | "items_collected";
  value: number;
}

export interface GameSettings {
  bgmVolume: number;
  seVolume: number;
  textSpeed: "slow" | "normal" | "fast";
  showTutorial: boolean;
}

export interface ShopInventory {
  itemId: string;
  stock: number;
}
