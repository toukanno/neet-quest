import { useGameStore } from "@/store/gameStore";
import { MAPS } from "@/data/maps";

export function DialogueBox() {
  const currentDialogue = useGameStore((s) => s.currentDialogue);
  const currentNpcId = useGameStore((s) => s.currentNpcId);
  const currentMapId = useGameStore((s) => s.currentMapId);
  const advanceDialogue = useGameStore((s) => s.advanceDialogue);
  const endDialogue = useGameStore((s) => s.endDialogue);

  if (!currentDialogue || !currentNpcId) return null;

  const map = MAPS[currentMapId];
  const npc = map?.npcs.find((n) => n.id === currentNpcId);
  const speakerName = npc?.name ?? "???";

  const handleChoice = (index: number) => {
    advanceDialogue(index);
  };

  const handleAdvance = () => {
    if (currentDialogue.choices && currentDialogue.choices.length > 0) return;
    endDialogue();
  };

  return (
    <div className="dialogue-box" onClick={handleAdvance}>
      <div className="dialogue-box__speaker">{speakerName}</div>
      <div className="dialogue-box__text">{currentDialogue.text}</div>
      {currentDialogue.choices && currentDialogue.choices.length > 0 && (
        <div className="dialogue-box__choices">
          {currentDialogue.choices.map((choice, i) => (
            <button
              key={i}
              className="btn btn--small"
              onClick={(e) => {
                e.stopPropagation();
                handleChoice(i);
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
      {(!currentDialogue.choices || currentDialogue.choices.length === 0) && (
        <div style={{ textAlign: "right", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          クリックで閉じる
        </div>
      )}
    </div>
  );
}
