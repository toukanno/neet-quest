// ======================================================
// Game Time System & Random Events
// ======================================================

// --- Types & Interfaces ---

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface GameTime {
  day: number;
  timeOfDay: TimeOfDay;
  totalSteps: number;
}

export interface EventContext {
  day: number;
  timeOfDay: TimeOfDay;
  socialPoints: number;
  currentMapId: string;
  chapter: number;
  playerLevel: number;
}

export interface EventEffect {
  type:
    | "heal_hp"
    | "heal_mp"
    | "gold"
    | "item"
    | "social_points"
    | "battle"
    | "dialogue";
  value: number;
  itemId?: string;
  enemyIds?: string[];
  message: string;
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  condition: (context: EventContext) => boolean;
  effect: EventEffect;
  probability: number;
}

// --- Time Progression Constants ---

const TIME_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];
const STEPS_PER_TIME_ADVANCE = 20;

// --- Random Events ---

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "moms_care_package",
    name: "母からの差し入れ",
    description: "お母さんが朝ごはんを持ってきてくれた。",
    condition: (ctx) =>
      ctx.timeOfDay === "morning" && ctx.currentMapId === "my_room",
    effect: {
      type: "heal_hp",
      value: 9999,
      message: "お母さんが朝ごはんを持ってきてくれた。HPが全回復した！",
    },
    probability: 0.3,
  },
  {
    id: "encouraging_line",
    name: "励ましのLINE",
    description: "昔の友達からLINEが来た。「元気？」",
    condition: (ctx) => ctx.socialPoints > 10,
    effect: {
      type: "social_points",
      value: 5,
      message: "昔の友達からLINEが来た。「元気？」少し嬉しかった。",
    },
    probability: 0.15,
  },
  {
    id: "stray_cat",
    name: "野良猫との出会い",
    description: "野良猫が寄ってきた。少し心が温まった。",
    condition: (ctx) =>
      ctx.currentMapId === "town" && ctx.timeOfDay === "afternoon",
    effect: {
      type: "heal_hp",
      value: 20,
      message: "野良猫が寄ってきた。少し心が温まった。HPが20回復した。",
    },
    probability: 0.25,
  },
  {
    id: "sudden_rain",
    name: "突然の雨",
    description: "雨が降ってきた。コンビニで傘を買った。",
    condition: (ctx) =>
      ctx.currentMapId === "town" && ctx.timeOfDay === "evening",
    effect: {
      type: "gold",
      value: -10,
      message: "雨が降ってきた。コンビニで傘を買った。10G失った。",
    },
    probability: 0.2,
  },
  {
    id: "bargain_sale",
    name: "バーゲンセール",
    description: "特売セール中！ラッキー！",
    condition: (ctx) => ctx.currentMapId === "convenience_store",
    effect: {
      type: "item",
      value: 1,
      itemId: "cup_noodle",
      message: "特売セール中！ラッキー！カップ麺を手に入れた！",
    },
    probability: 0.2,
  },
  {
    id: "wave_of_anxiety",
    name: "不安の波",
    description: "夜の不安が押し寄せてきた...",
    condition: (ctx) => ctx.timeOfDay === "night" && ctx.chapter >= 1,
    effect: {
      type: "battle",
      value: 0,
      enemyIds: ["bat_anxiety"],
      message: "夜の不安が押し寄せてきた...不安コウモリが現れた！",
    },
    probability: 0.2,
  },
  {
    id: "late_night_surfing",
    name: "深夜のネットサーフィン",
    description: "ネットで役立つ情報を見つけた。",
    condition: (ctx) =>
      ctx.currentMapId === "my_room" && ctx.timeOfDay === "night",
    effect: {
      type: "heal_mp",
      value: 10,
      message: "ネットで役立つ情報を見つけた。MPが10回復した。",
    },
    probability: 0.25,
  },
  {
    id: "neighbor_greeting",
    name: "近所の人に挨拶された",
    description:
      "ご近所さんに挨拶された。ドキドキしたけど、返せた。",
    condition: (ctx) =>
      ctx.currentMapId === "town" &&
      ctx.timeOfDay === "morning" &&
      ctx.socialPoints >= 5,
    effect: {
      type: "social_points",
      value: 3,
      message:
        "ご近所さんに挨拶された。ドキドキしたけど、返せた。社会性ポイント+3！",
    },
    probability: 0.25,
  },
  {
    id: "job_flyer",
    name: "求人チラシを拾った",
    description: "道に落ちていた求人チラシを拾った。少し読んでみた。",
    condition: (ctx) => ctx.currentMapId === "town",
    effect: {
      type: "social_points",
      value: 2,
      message:
        "道に落ちていた求人チラシを拾った。少し読んでみた。社会性ポイント+2。",
    },
    probability: 0.1,
  },
  {
    id: "convenience_store_job",
    name: "コンビニバイトの誘い",
    description: "店長に「バイトしてみない？」と誘われた。",
    condition: (ctx) =>
      ctx.currentMapId === "convenience_store" && ctx.day >= 5,
    effect: {
      type: "social_points",
      value: 10,
      message:
        "店長に「バイトしてみない？」と誘われた。社会性ポイント+10！大きな一歩だ。",
    },
    probability: 0.15,
  },
];

// --- Functions ---

/**
 * Advances the game clock based on total steps taken.
 * Every 20 steps, time of day progresses by one phase.
 * After "night", the day increments and time resets to "morning".
 */
export function advanceTime(current: GameTime): GameTime {
  const newTotalSteps = current.totalSteps + 1;

  const currentIndex = TIME_ORDER.indexOf(current.timeOfDay);
  const stepsInCurrentPhase =
    newTotalSteps % STEPS_PER_TIME_ADVANCE;

  if (
    stepsInCurrentPhase === 0 &&
    newTotalSteps !== current.totalSteps
  ) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= TIME_ORDER.length) {
      return {
        day: current.day + 1,
        timeOfDay: TIME_ORDER[0],
        totalSteps: newTotalSteps,
      };
    }

    return {
      day: current.day,
      timeOfDay: TIME_ORDER[nextIndex],
      totalSteps: newTotalSteps,
    };
  }

  return {
    day: current.day,
    timeOfDay: current.timeOfDay,
    totalSteps: newTotalSteps,
  };
}

/**
 * Checks all random events against the current context.
 * Each qualifying event is rolled against its probability.
 * Returns the first event that passes both condition and probability check,
 * or null if no event triggers.
 */
export function checkRandomEvent(
  context: EventContext,
): RandomEvent | null {
  const shuffled = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);

  for (const event of shuffled) {
    if (event.condition(context) && Math.random() < event.probability) {
      return event;
    }
  }

  return null;
}
