declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

/**
 * Google Analytics 4 の gtag.js を動的に読み込む
 */
export function initGA(): void {
  if (!GA_ID) return;
  if (typeof window === "undefined") return;

  // gtag.js スクリプトを挿入
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // dataLayer と gtag 関数を初期化
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

/**
 * ページビューを送信
 */
export function pageview(path: string): void {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: path });
}

/**
 * カスタムイベントを送信
 */
export function event(
  action: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params);
}
