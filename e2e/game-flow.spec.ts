import { test, expect } from "@playwright/test";

test.describe("ゲームフロー", () => {
  test("タイトル画面が表示される", async ({ page }) => {
    await page.goto("/");

    // タイトルが表示されていること
    await expect(page.locator("h1")).toHaveText("ニートクエスト");

    // サブタイトルが表示されていること
    await expect(page.locator(".title-screen__subtitle")).toHaveText(
      "ニートが勇者として社会復帰するRPG"
    );

    // 「はじめから」ボタンが存在すること
    await expect(
      page.getByRole("button", { name: "はじめから" })
    ).toBeVisible();
  });

  test("「はじめから」ボタンのクリックでゲーム開始", async ({ page }) => {
    await page.goto("/");

    // 「はじめから」をクリック
    await page.getByRole("button", { name: "はじめから" }).click();

    // /game に遷移すること
    await expect(page).toHaveURL(/\/game/);
  });

  test("ゲーム画面の基本要素の表示確認", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "はじめから" }).click();
    await expect(page).toHaveURL(/\/game/);

    // HUD が表示されていること
    await expect(page.locator(".hud")).toBeVisible();

    // マップエリアが表示されていること
    await expect(page.locator(".game-screen__map-area")).toBeVisible();

    // D-pad コントロールが表示されていること
    await expect(page.locator(".dpad")).toBeVisible();

    // ナビゲーションボタンが表示されていること
    await expect(
      page.getByRole("button", { name: /ステータス/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /持ち物/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /クエスト/ })
    ).toBeVisible();
  });
});
