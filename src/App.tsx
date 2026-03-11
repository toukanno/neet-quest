import { Routes, Route, Navigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { TitleScreen } from "@/screens/TitleScreen";
import { GameScreen } from "@/screens/GameScreen";
import { BattleScreen } from "@/screens/BattleScreen";
import { StatusScreen } from "@/screens/StatusScreen";
import { InventoryScreen } from "@/screens/InventoryScreen";
import { QuestScreen } from "@/screens/QuestScreen";
import { SaveLoadScreen } from "@/screens/SaveLoadScreen";

export function App() {
  const battle = useGameStore((s) => s.battle);

  return (
    <div className="app">
      {battle ? (
        <BattleScreen />
      ) : (
        <Routes>
          <Route path="/" element={<TitleScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/status" element={<StatusScreen />} />
          <Route path="/inventory" element={<InventoryScreen />} />
          <Route path="/quests" element={<QuestScreen />} />
          <Route path="/save" element={<SaveLoadScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}
