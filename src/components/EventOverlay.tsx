import { useGameStore } from "@/store/gameStore";

export function EventOverlay() {
  const currentEvent = useGameStore((s) => s.currentEvent);
  const dismissEvent = useGameStore((s) => s.dismissEvent);
  const healHp = useGameStore((s) => s.healHp);
  const healMp = useGameStore((s) => s.healMp);
  const addGold = useGameStore((s) => s.addGold);
  const addItem = useGameStore((s) => s.addItem);
  const addSocialPoints = useGameStore((s) => s.addSocialPoints);
  const startBattle = useGameStore((s) => s.startBattle);

  if (!currentEvent) return null;

  const { effect } = currentEvent;

  const handleOk = () => {
    switch (effect.type) {
      case "heal_hp":
        healHp(effect.value);
        break;
      case "heal_mp":
        healMp(effect.value);
        break;
      case "gold":
        addGold(effect.value);
        break;
      case "item":
        addItem(effect.itemId!, effect.value);
        break;
      case "social_points":
        addSocialPoints(effect.value);
        break;
      case "battle":
        startBattle(effect.enemyIds!);
        break;
      case "dialogue":
        break;
    }
    dismissEvent();
  };

  return (
    <>
      <style>{`
        .event-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: event-overlay-fade-in 0.2s ease-out;
        }

        .event-overlay__panel {
          background: var(--bg-secondary);
          border: 2px solid var(--accent);
          border-radius: 12px;
          padding: 2rem;
          max-width: 420px;
          width: 90%;
          text-align: center;
          animation: event-panel-slide-up 0.25s ease-out;
        }

        .event-overlay__name {
          color: var(--accent);
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .event-overlay__message {
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          white-space: pre-wrap;
        }

        @keyframes event-overlay-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes event-panel-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="event-overlay" role="dialog" aria-modal="true" aria-label={currentEvent.name}>
        <div className="event-overlay__panel">
          <div className="event-overlay__name">{currentEvent.name}</div>
          <div className="event-overlay__message">{effect.message}</div>
          <button className="btn btn--primary" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </>
  );
}
