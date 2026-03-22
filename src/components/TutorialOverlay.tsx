import { useGameStore } from "@/store/gameStore";

const TUTORIAL_STEPS = [
  {
    title: "ようこそニートクエストへ！",
    text: "あなたは引きこもり歴3年の元ニート。\n社会復帰を目指す冒険が今、始まる！",
  },
  {
    title: "移動方法",
    text: "WASDキーまたは画面のボタンで移動できます。\n矢印キーでもOK！",
  },
  {
    title: "NPCとの会話",
    text: "NPCに話しかけてクエストを受けましょう。\nNPCの隣に立って Space / Enter キーで会話できます。",
  },
  {
    title: "バトル",
    text: "敵と遭遇するとバトルが始まります。\n「こうげき」「スキル」「アイテム」「にげる」から行動を選びましょう。",
  },
  {
    title: "ゲームの目標",
    text: "社会復帰度を上げてエンディングを目指そう！\nクエストを進めて経験を積みましょう。\n\nQ キーでクエスト一覧を確認できます。",
  },
];

export function TutorialOverlay() {
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const skipTutorial = useGameStore((s) => s.skipTutorial);

  if (tutorialStep <= 0 || tutorialStep > TUTORIAL_STEPS.length) return null;

  const step = TUTORIAL_STEPS[tutorialStep - 1];
  const isLast = tutorialStep === TUTORIAL_STEPS.length;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-box">
        <div className="tutorial-step">
          {tutorialStep} / {TUTORIAL_STEPS.length}
        </div>
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-text">{step.text}</p>
        <div className="tutorial-actions">
          <button className="btn btn--small" onClick={skipTutorial}>
            スキップ
          </button>
          <button
            className="btn btn--small btn--primary"
            onClick={isLast ? skipTutorial : advanceTutorial}
          >
            {isLast ? "はじめる！" : "つぎへ"}
          </button>
        </div>
      </div>

      <style>{`
        .tutorial-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .tutorial-box {
          background: var(--bg-secondary);
          border: 2px solid var(--accent);
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
        }
        .tutorial-step {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .tutorial-title {
          color: var(--accent);
          margin-bottom: 0.8rem;
          font-size: 1.1rem;
        }
        .tutorial-text {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.8;
          white-space: pre-wrap;
          margin-bottom: 1.2rem;
        }
        .tutorial-actions {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}
