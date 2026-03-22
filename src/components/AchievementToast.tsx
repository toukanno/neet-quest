import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementToast() {
  const lastAchievement = useGameStore((s) => s.lastAchievement);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);

  useEffect(() => {
    if (lastAchievement) {
      const timer = setTimeout(dismissAchievement, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAchievement, dismissAchievement]);

  if (!lastAchievement) return null;

  const ach = ACHIEVEMENTS[lastAchievement];
  if (!ach) return null;

  return (
    <div className="achievement-toast" onClick={dismissAchievement}>
      <div className="achievement-toast__icon">{ach.icon}</div>
      <div>
        <div className="achievement-toast__label">実績解除！</div>
        <div className="achievement-toast__name">{ach.name}</div>
        <div className="achievement-toast__desc">{ach.description}</div>
      </div>

      <style>{`
        .achievement-toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1.2rem;
          background: var(--bg-secondary);
          border: 2px solid var(--gold);
          border-radius: 12px;
          z-index: 999;
          cursor: pointer;
          animation: toast-in 0.3s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        @keyframes toast-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .achievement-toast__icon {
          font-size: 1.8rem;
        }
        .achievement-toast__label {
          font-size: 0.65rem;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .achievement-toast__name {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 700;
        }
        .achievement-toast__desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
