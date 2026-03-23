import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.describe("アクセシビリティ (a11y)", () => {
  test("タイトル画面に重大なa11y違反がない", async ({ page }) => {
    await page.goto("/");

    // タイトル画面が表示されるまで待つ
    await expect(page.locator("h1")).toHaveText("ニートクエスト");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("ゲーム画面に重大なa11y違反がない", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "はじめから" }).click();
    await expect(page).toHaveURL(/\/game/);

    // ゲーム画面が読み込まれるまで待つ
    await expect(page.locator(".hud")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("タイトル画面のキーボードナビゲーション", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("ニートクエスト");

    // Tab キーでフォーカス可能な要素に移動できる
    await page.keyboard.press("Tab");

    // フォーカスされた要素が存在すること
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Enter キーでボタンを押下できる
    // 「はじめから」ボタンにフォーカスが当たるまで Tab
    const startButton = page.getByRole("button", { name: "はじめから" });

    // ボタンにフォーカスを当てる
    await startButton.focus();
    await expect(startButton).toBeFocused();

    // Enter で遷移
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/game/);
  });

  test("ゲーム画面のキーボードナビゲーション", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "はじめから" }).click();
    await expect(page).toHaveURL(/\/game/);
    await expect(page.locator(".hud")).toBeVisible();

    // ナビゲーションボタンにキーボードでアクセスできる
    const statusButton = page.getByRole("button", { name: /ステータス/ });
    const inventoryButton = page.getByRole("button", { name: /持ち物/ });
    const questButton = page.getByRole("button", { name: /クエスト/ });

    // 各ボタンがフォーカス可能であること
    await statusButton.focus();
    await expect(statusButton).toBeFocused();

    await inventoryButton.focus();
    await expect(inventoryButton).toBeFocused();

    await questButton.focus();
    await expect(questButton).toBeFocused();
  });
});
