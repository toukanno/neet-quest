// =============================================================================
// endings.ts - Multi-ending system based on social reintegration progress
// =============================================================================

export interface EndingContext {
  socialPoints: number;
  completedQuests: string[];
  chapter: number;
  playerLevel: number;
  partySize: number;
  day: number;
}

export interface Ending {
  id: string;
  name: string;
  title: string;
  description: string;
  condition: (context: EndingContext) => boolean;
  rank: number;
  epilogue: string[];
}

// -----------------------------------------------------------------------------
// Endings definition (checked in descending rank order)
// -----------------------------------------------------------------------------

const MAIN_QUESTS = ["main_1", "main_2", "main_3", "main_4"] as const;

function hasCompletedQuests(
  completed: string[],
  required: string[],
): boolean {
  return required.every((q) => completed.includes(q));
}

export const ENDINGS: Ending[] = [
  // Rank 5 - TRUE ENDING
  {
    id: "true_end",
    name: "新しい朝",
    title: "TRUE END \u2014 新しい朝",
    description:
      "主人公はすべての恐怖を乗り越え、仕事を見つけ、仲間とともに新しい生活を始めた。",
    rank: 5,
    condition: (ctx) =>
      ctx.socialPoints >= 200 &&
      hasCompletedQuests(ctx.completedQuests, [...MAIN_QUESTS]) &&
      ctx.chapter >= 5 &&
      ctx.partySize >= 2,
    epilogue: [
      "目覚まし時計が鳴る。朝7時。",
      "ベッドから起き上がり、カーテンを開ける。外は快晴だ。",
      "「おはよう」とお母さんに声をかけ、朝ごはんを食べる。",
      "スーツに着替え、玄関で靴を履く。",
      "「いってきます」——その言葉が、こんなに温かいものだったなんて。",
      "ゆきと大輔からLINEが来ている。「今日も頑張ろう！」",
      "新しい朝が始まる。もう、一人じゃない。",
    ],
  },

  // Rank 4 - GOOD ENDING
  {
    id: "good_end",
    name: "一歩ずつ",
    title: "GOOD END \u2014 一歩ずつ",
    description:
      "主人公は着実に前進しているが、まだ道半ばだ。",
    rank: 4,
    condition: (ctx) =>
      ctx.socialPoints >= 100 &&
      hasCompletedQuests(ctx.completedQuests, [
        "main_1",
        "main_2",
        "main_3",
      ]),
    epilogue: [
      "ハローワークからの帰り道。",
      "まだ面接は怖い。でも、前よりは少しマシだ。",
      "コンビニに寄って、お弁当を買う。店員の佐藤さんが「お疲れ様」と声をかけてくれた。",
      "家に帰ると、お母さんが笑顔で迎えてくれた。",
      "まだ先は長い。でも、一歩ずつ進んでいけばいい。",
    ],
  },

  // Rank 3 - NORMAL ENDING
  {
    id: "normal_end",
    name: "変化の兆し",
    title: "NORMAL END \u2014 変化の兆し",
    description:
      "主人公は少しずつ変わり始めているが、その歩みはゆっくりだ。",
    rank: 3,
    condition: (ctx) =>
      ctx.socialPoints >= 50 &&
      hasCompletedQuests(ctx.completedQuests, ["main_1", "main_2"]),
    epilogue: [
      "外に出ることには、まだ慣れない。",
      "でも、コンビニまでなら一人で行けるようになった。",
      "お母さんが嬉しそうにしている。それが少し、くすぐったい。",
      "明日は...もう少し遠くまで行ってみようかな。",
    ],
  },

  // Rank 2 - BAD ENDING
  {
    id: "bad_end",
    name: "長い夜",
    title: "BAD END \u2014 長い夜",
    description:
      "主人公は部屋に戻ってしまった。",
    rank: 2,
    condition: (ctx) =>
      ctx.socialPoints >= 10 &&
      hasCompletedQuests(ctx.completedQuests, ["main_1"]),
    epilogue: [
      "外は怖かった。人の目が怖かった。",
      "部屋に戻って、布団にもぐりこむ。",
      "モニターの光だけが、暗い部屋を照らしている。",
      "...でも、一度外に出たという事実は消えない。",
      "いつかまた、ドアを開ける日が来るかもしれない。",
    ],
  },

  // Rank 1 - WORST ENDING (fallback)
  {
    id: "worst_end",
    name: "永遠の部屋",
    title: "END \u2014 永遠の部屋",
    description:
      "主人公は一度も部屋を出ることがなかった。",
    rank: 1,
    condition: () => true,
    epilogue: [
      "何も変わらない日々。",
      "モニターの前で、また一日が過ぎていく。",
      "お母さんの「ごはんよ」という声が、ドアの向こうから聞こえる。",
      "...いつか、このドアを開ける時が来るのだろうか。",
    ],
  },
];

// -----------------------------------------------------------------------------
// Ending resolution
// -----------------------------------------------------------------------------

/**
 * Evaluate endings by rank (highest first) and return the first match.
 */
export function getEnding(context: EndingContext): Ending {
  const sorted = [...ENDINGS].sort((a, b) => b.rank - a.rank);

  for (const ending of sorted) {
    if (ending.condition(context)) {
      return ending;
    }
  }

  // Should never reach here because worst_end is always true,
  // but TypeScript needs a guaranteed return.
  return ENDINGS[ENDINGS.length - 1];
}

// -----------------------------------------------------------------------------
// Social rank label
// -----------------------------------------------------------------------------

interface SocialRankTier {
  min: number;
  label: string;
}

const SOCIAL_RANK_TIERS: SocialRankTier[] = [
  { min: 200, label: "社会人" },
  { min: 150, label: "就活勇者" },
  { min: 100, label: "アルバイト戦士" },
  { min: 50, label: "社会復帰見習い" },
  { min: 20, label: "外出練習中" },
  { min: 0, label: "ひきこもり" },
];

/**
 * Return a display label for the player's current social reintegration level.
 */
export function getSocialRank(socialPoints: number): string {
  for (const tier of SOCIAL_RANK_TIERS) {
    if (socialPoints >= tier.min) {
      return tier.label;
    }
  }
  return "ひきこもり";
}
