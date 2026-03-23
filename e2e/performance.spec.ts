import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

test.describe("パフォーマンステスト", () => {
  test("タイトル画面の初期ロードが3秒以内", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });

  test("ゲーム画面への遷移が1秒以内", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // タイトル画面からゲーム画面へ遷移するアクションを実行
    const start = Date.now();
    const startButton = page.getByRole("button", {
      name: /はじめる|スタート|start|ニューゲーム/i,
    });
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
    } else {
      // ボタンが見つからない場合は直接遷移
      await page.goto("/game");
    }
    await page.waitForLoadState("networkidle");
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
  });

  test("バンドルサイズが500KB以内", () => {
    const distDir = path.resolve(__dirname, "../dist/assets");

    if (!fs.existsSync(distDir)) {
      test.skip();
      return;
    }

    const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith(".js"));
    let totalSize = 0;

    for (const file of jsFiles) {
      const stat = fs.statSync(path.join(distDir, file));
      totalSize += stat.size;
    }

    const totalKB = totalSize / 1024;
    console.log(`Total JS bundle size: ${totalKB.toFixed(1)} KB`);
    expect(totalKB).toBeLessThan(500);
  });
});
