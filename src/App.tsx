import { Routes, Route, Navigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";
import { TitleScreen } from "@/screens/TitleScreen";
import { GameScreen } from "@/screens/GameScreen";
import { BattleScreen } from "@/screens/BattleScreen";
import { StatusScreen } from "@/screens/StatusScreen";
import { InventoryScreen } from "@/screens/InventoryScreen";
import { QuestScreen } from "@/screens/QuestScreen";
import { SaveLoadScreen } from "@/screens/SaveLoadScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { ShopScreen } from "@/screens/ShopScreen";
import { AchievementsScreen } from "@/screens/AchievementsScreen";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { AchievementToast } from "@/components/AchievementToast";
import { EndingScreen } from "@/screens/EndingScreen";
import { GameOverScreen } from "@/screens/GameOverScreen";
import { EventOverlay } from "@/components/EventOverlay";

export function App() {
  const battle = useGameStore((s) => s.battle);
  const player = useGameStore((s) => s.player);
  const currentEnding = useGameStore((s) => s.currentEnding);
  const tutorialStep = useGameStore((s) => s.tutorialStep);

  if (currentEnding) {
    return (
      <div className="app">
        <EndingScreen />
      </div>
    );
  }

  if (!battle && player.hp <= 0) {
    return (
      <div className="app">
        <GameOverScreen />
      </div>
    );
  }

  return (
    <div className="app">
      {battle ? (
        <BattleScreen />
      ) : (
        <>
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/game" element={<GameScreen />} />
            <Route path="/status" element={<StatusScreen />} />
            <Route path="/inventory" element={<InventoryScreen />} />
            <Route path="/quests" element={<QuestScreen />} />
            <Route path="/save" element={<SaveLoadScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/shop" element={<ShopScreen />} />
            <Route path="/achievements" element={<AchievementsScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <EventOverlay />
        </>
      )}
      {tutorialStep > 0 && <TutorialOverlay />}
      <AchievementToast />
    </div>
  );
}
