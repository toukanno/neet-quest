import type { GameMap, MapTile, NPC } from "@/types/game";

function tile(
  type: MapTile["type"],
  passable = true,
  entityId?: string
): MapTile {
  return { type, passable, sprite: type, entityId };
}

const F = () => tile("floor");
const W = () => tile("wall", false);
const N = (id: string) => tile("npc", true, id);
const E = (id: string) => tile("enemy", true, id);
const X = (id: string) => tile("exit", true, id);

const npcMom: NPC = {
  id: "npc_mom",
  name: "お母さん",
  role: "家族",
  position: { x: 3, y: 2 },
  sprite: "mom",
  dialogues: [
    {
      id: "mom_1",
      text: "あら、起きたの？朝ごはん作ったわよ。\nそろそろ外に出てみない？",
      choices: [
        { text: "うん、がんばってみる", nextDialogueId: "mom_2" },
        { text: "まだ無理...", nextDialogueId: "mom_3" },
      ],
    },
    {
      id: "mom_2",
      text: "えらいわ！まずはコンビニまで行ってみましょう。\nお金あげるから、お弁当買ってきて。",
    },
    {
      id: "mom_3",
      text: "焦らなくていいのよ。でもね、一歩だけ踏み出してみない？\nドアの向こうは怖くないよ。",
      choices: [
        { text: "...わかった、やってみる", nextDialogueId: "mom_2" },
      ],
    },
  ],
};

const npcReceptionist: NPC = {
  id: "npc_receptionist",
  name: "受付のお姉さん",
  role: "ハローワーク職員",
  position: { x: 5, y: 1 },
  sprite: "receptionist",
  dialogues: [
    {
      id: "recv_1",
      text: "ハローワークへようこそ！\n初めてですか？大丈夫、一緒にお仕事探しましょう。",
      choices: [
        { text: "よろしくお願いします", nextDialogueId: "recv_2" },
        { text: "緊張します...", nextDialogueId: "recv_3" },
      ],
    },
    {
      id: "recv_2",
      text: "まずは登録カードを作りますね。\nこれがあなたの冒険者カードです！",
    },
    {
      id: "recv_3",
      text: "大丈夫ですよ、みんな最初は緊張するものです。\nゆっくりいきましょう！",
      choices: [
        { text: "ありがとうございます", nextDialogueId: "recv_2" },
      ],
    },
  ],
};

const npcStoreManager: NPC = {
  id: "npc_store_manager",
  name: "コンビニ店長",
  role: "バイト先の店長",
  position: { x: 4, y: 2 },
  sprite: "manager",
  dialogues: [
    {
      id: "mgr_1",
      text: "おう、新人か！やる気はあるか？\nまずは品出しからやってもらうぞ！",
      choices: [
        { text: "はい、がんばります！", nextDialogueId: "mgr_2" },
        { text: "あの...ちょっと不安で...", nextDialogueId: "mgr_3" },
      ],
    },
    {
      id: "mgr_2",
      text: "いい返事だ！でもまず、倉庫の先延ばしゴブリンを片付けてくれ。\nサボり癖の塊みたいなやつらだ。",
    },
    {
      id: "mgr_3",
      text: "不安？大丈夫だ、俺だって最初は不安だった。\nやってるうちに慣れるもんだ。さ、まずは倉庫からだ！",
      choices: [
        { text: "わかりました！", nextDialogueId: "mgr_2" },
      ],
    },
  ],
};

const npcJogger: NPC = {
  id: "npc_jogger",
  name: "ジョギングおじさん",
  role: "公園のランナー",
  position: { x: 5, y: 4 },
  sprite: "jogger",
  dialogues: [
    {
      id: "jogger_1",
      text: "おっ、散歩かい？いいね！\n体を動かすと気持ちも前向きになるぞ！",
      choices: [
        { text: "走るのって楽しいですか？", nextDialogueId: "jogger_2" },
        { text: "ちょっと疲れました...", nextDialogueId: "jogger_3" },
      ],
    },
    {
      id: "jogger_2",
      text: "最初はキツいけどな、続けてると体が軽くなるんだ！\nまずは歩くだけでも十分さ。一緒に一周どうだ？",
    },
    {
      id: "jogger_3",
      text: "無理しなくていいぞ！ベンチで休んでいけ。\nでもな、ここまで来れたこと自体がすごいんだぜ！",
      choices: [
        { text: "...ありがとうございます", nextDialogueId: "jogger_2" },
      ],
    },
  ],
};

const npcYuki: NPC = {
  id: "npc_yuki",
  name: "ゆき",
  role: "社会復帰支援グループのメンバー",
  position: { x: 2, y: 3 },
  sprite: "yuki",
  dialogues: [
    {
      id: "yuki_1",
      text: "...あ、こんにちは。私、ゆきです。\nここには...絵を描きに来てるんです。",
      choices: [
        { text: "絵、見せてもらってもいい？", nextDialogueId: "yuki_2" },
        { text: "俺もここ初めてで...", nextDialogueId: "yuki_3" },
      ],
    },
    {
      id: "yuki_2",
      text: "え、いいの？...これ、外の景色を想像して描いたの。\n一緒に外に出て...本物を見てみたいな。",
      choices: [
        { text: "一緒に行こう！", nextDialogueId: "yuki_join" },
      ],
    },
    {
      id: "yuki_3",
      text: "そうなんだ...私も最初は怖かったけど、\nここの人たちは優しいよ。",
      choices: [
        { text: "一緒に冒険しない？", nextDialogueId: "yuki_join" },
      ],
    },
    {
      id: "yuki_join",
      text: "え...一緒に？...うん、行きたい！\nゆきが仲間になった！",
      condition: "join:yuki",
    },
  ],
};

const npcDaisuke: NPC = {
  id: "npc_daisuke",
  name: "大輔",
  role: "社会復帰支援グループのメンバー",
  position: { x: 5, y: 3 },
  sprite: "daisuke",
  dialogues: [
    {
      id: "daisuke_1",
      text: "...ああ、新しい人か。俺は大輔。\n元SEだ。今は...まあ、リハビリ中。",
      choices: [
        { text: "SEって、プログラミングとか？", nextDialogueId: "daisuke_2" },
        { text: "リハビリ、大変？", nextDialogueId: "daisuke_3" },
      ],
    },
    {
      id: "daisuke_2",
      text: "ああ。デバッグが得意でな。\n...人生のバグも、いつか直せるといいんだが。",
      choices: [
        { text: "一緒にバグ取りしようぜ", nextDialogueId: "daisuke_join" },
      ],
    },
    {
      id: "daisuke_3",
      text: "まあな。でも前みたいに一人で抱え込まないようにしてる。\n...お前も、一人で戦ってないか？",
      choices: [
        { text: "力を貸してくれ", nextDialogueId: "daisuke_join" },
      ],
    },
    {
      id: "daisuke_join",
      text: "...いいだろう。お前に付き合ってやる。\n大輔が仲間になった！",
      condition: "join:daisuke",
    },
  ],
};

export const MAPS: Record<string, GameMap> = {
  my_room: {
    id: "my_room",
    name: "自分の部屋",
    width: 8,
    height: 6,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), W(), W(), X("home"), W(), W(), W(), W()],
    ],
    npcs: [],
    enemies: [],
    bgm: "room",
  },
  home: {
    id: "home",
    name: "自宅リビング",
    width: 8,
    height: 6,
    tiles: [
      [W(), W(), W(), X("my_room"), W(), W(), W(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), N("npc_mom"), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), W(), W(), X("town"), W(), W(), W(), W()],
    ],
    npcs: [npcMom],
    enemies: [],
    bgm: "home",
  },
  town: {
    id: "town",
    name: "近所の街",
    width: 10,
    height: 8,
    tiles: [
      [W(), W(), X("home"), W(), W(), W(), W(), W(), W(), W()],
      [F(), F(), F(), F(), F(), F(), F(), F(), F(), F()],
      [F(), F(), E("slime_laziness"), F(), F(), F(), E("bat_anxiety"), F(), F(), F()],
      [F(), F(), F(), F(), X("convenience_store"), F(), F(), F(), F(), F()],
      [F(), E("slime_laziness"), F(), F(), F(), F(), F(), E("slime_laziness"), F(), F()],
      [F(), F(), F(), F(), F(), F(), F(), F(), F(), X("park")],
      [F(), F(), F(), E("bat_anxiety"), F(), F(), X("hello_work"), F(), F(), F()],
      [W(), W(), W(), W(), X("support_center"), W(), W(), W(), W(), W()],
    ],
    npcs: [],
    enemies: ["slime_laziness", "bat_anxiety"],
    bgm: "town",
  },
  convenience_store: {
    id: "convenience_store",
    name: "コンビニ",
    width: 8,
    height: 6,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), N("npc_store_manager"), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), W(), W(), X("town"), W(), W(), W(), W()],
    ],
    npcs: [npcStoreManager],
    enemies: [],
    bgm: "shop",
  },
  hello_work: {
    id: "hello_work",
    name: "ハローワーク",
    width: 8,
    height: 6,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), F(), F(), F(), F(), N("npc_receptionist"), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), W(), W(), X("town"), W(), W(), W(), W()],
    ],
    npcs: [npcReceptionist],
    enemies: [],
    bgm: "hellowork",
  },
  interview_dungeon: {
    id: "interview_dungeon",
    name: "面接ダンジョン",
    width: 10,
    height: 8,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), F(), F(), E("goblin_procrastination"), F(), F(), F(), E("skeleton_deadline"), F(), W()],
      [W(), F(), W(), W(), F(), W(), W(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), W(), F(), E("skeleton_deadline"), F(), W(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), E("goblin_procrastination"), F(), F(), F(), E("interviewer_golem"), F(), F(), W()],
      [W(), X("hello_work"), W(), W(), W(), W(), W(), W(), W(), W()],
    ],
    npcs: [],
    enemies: ["goblin_procrastination", "skeleton_deadline"],
    bgm: "dungeon",
  },
  park: {
    id: "park",
    name: "公園",
    width: 10,
    height: 8,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), W(), F(), F(), F(), W(), F(), F(), W(), W()],
      [W(), F(), F(), E("wolf_comparison"), F(), F(), F(), F(), F(), W()],
      [W(), F(), W(), F(), F(), F(), F(), W(), F(), W()],
      [X("town"), F(), F(), F(), F(), N("npc_jogger"), F(), F(), F(), W()],
      [W(), F(), F(), F(), W(), F(), F(), E("bat_anxiety"), F(), W()],
      [W(), W(), F(), F(), F(), F(), F(), F(), W(), W()],
      [W(), W(), W(), W(), W(), W(), W(), W(), W(), W()],
    ],
    npcs: [npcJogger],
    enemies: ["wolf_comparison", "bat_anxiety"],
    bgm: "park",
  },
  support_center: {
    id: "support_center",
    name: "社会復帰支援センター",
    width: 8,
    height: 6,
    tiles: [
      [W(), W(), W(), W(), W(), W(), W(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), F(), N("npc_yuki"), F(), F(), N("npc_daisuke"), F(), W()],
      [W(), F(), F(), F(), F(), F(), F(), W()],
      [W(), W(), W(), X("town"), W(), W(), W(), W()],
    ],
    npcs: [npcYuki, npcDaisuke],
    enemies: [],
    bgm: "support_center",
  },
};
