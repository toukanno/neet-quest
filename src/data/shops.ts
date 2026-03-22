import type { ShopInventory } from "@/types/game";

export interface ShopDef {
  id: string;
  name: string;
  greeting: string;
  inventory: ShopInventory[];
}

export const SHOPS: Record<string, ShopDef> = {
  convenience_store: {
    id: "convenience_store",
    name: "コンビニ",
    greeting: "いらっしゃいませ！",
    inventory: [
      { itemId: "cup_noodle", stock: -1 },
      { itemId: "energy_drink", stock: -1 },
      { itemId: "bento", stock: -1 },
      { itemId: "protein", stock: 5 },
    ],
  },
  hello_work: {
    id: "hello_work",
    name: "ハローワーク売店",
    greeting: "就活グッズはいかがですか？",
    inventory: [
      { itemId: "resume_sword", stock: 1 },
      { itemId: "business_suit", stock: 1 },
      { itemId: "sneakers", stock: 3 },
      { itemId: "earphones", stock: 2 },
      { itemId: "keyboard", stock: 1 },
    ],
  },
};
