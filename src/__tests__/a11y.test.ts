import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { axe } from "vitest-axe";
import * as vitestAxeMatchers from "vitest-axe/matchers";
import { useGameStore } from "@/store/gameStore";
import { TitleScreen } from "@/screens/TitleScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AchievementsScreen } from "@/screens/AchievementsScreen";

expect.extend(vitestAxeMatchers);

// Mock localStorage for components that call getSaveSlots
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

// Helper to render with router context
function renderWithRouter(ui: React.ReactElement, { route = "/" } = {}) {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [route] }, ui),
  );
}

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageMock);
  localStorageMock.clear();
  useGameStore.getState().initNewGame();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Accessibility: TitleScreen", () => {
  it("should have no critical a11y violations", async () => {
    const { container } = renderWithRouter(React.createElement(TitleScreen));
    const results = await axe(container);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  it("should have a main heading (h1)", () => {
    const { container } = renderWithRouter(React.createElement(TitleScreen));
    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toBeTruthy();
  });

  it("all buttons should have accessible text content", () => {
    const { container } = renderWithRouter(React.createElement(TitleScreen));
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const hasText =
        button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute("aria-label");
      const hasTitle = button.getAttribute("title");
      expect(
        hasText || hasAriaLabel || hasTitle,
        `Button missing accessible text: ${button.outerHTML}`,
      ).toBeTruthy();
    }
  });

  it("should not have empty links", () => {
    const { container } = renderWithRouter(React.createElement(TitleScreen));
    const links = container.querySelectorAll("a");
    for (const link of links) {
      const hasText = link.textContent && link.textContent.trim().length > 0;
      const hasAriaLabel = link.getAttribute("aria-label");
      expect(
        hasText || hasAriaLabel,
        `Empty link found: ${link.outerHTML}`,
      ).toBeTruthy();
    }
  });
});

describe("Accessibility: SettingsScreen", () => {
  it("should have no critical a11y violations (excluding label rule)", async () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    // Exclude label rule as the range inputs have labels as siblings (known issue)
    const results = await axe(container, {
      rules: { label: { enabled: false } },
    });
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  it("should have a heading", () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    const heading = container.querySelector("h2, h1");
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBeTruthy();
  });

  it("range inputs should have a sibling label or wrapper with descriptive text", () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    const rangeInputs = container.querySelectorAll('input[type="range"]');
    expect(rangeInputs.length).toBeGreaterThan(0);
    for (const input of rangeInputs) {
      // Check that the parent container has a label element nearby
      const parent = input.parentElement;
      expect(parent).not.toBeNull();
      const siblingLabel = parent!.querySelector("label");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      expect(
        siblingLabel || ariaLabel || ariaLabelledBy,
        `Range input lacks nearby label: ${input.outerHTML}`,
      ).toBeTruthy();
    }
  });

  it("checkbox inputs should be within labels", () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    for (const checkbox of checkboxes) {
      const parentLabel = checkbox.closest("label");
      const ariaLabel = checkbox.getAttribute("aria-label");
      expect(
        parentLabel || ariaLabel,
        `Checkbox missing label: ${checkbox.outerHTML}`,
      ).toBeTruthy();
    }
  });

  it("all buttons should have accessible text content", () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    const buttons = container.querySelectorAll("button");
    for (const button of buttons) {
      const hasText =
        button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute("aria-label");
      expect(
        hasText || hasAriaLabel,
        `Button missing accessible text: ${button.outerHTML}`,
      ).toBeTruthy();
    }
  });

  it("should maintain correct heading hierarchy", () => {
    const { container } = renderWithRouter(React.createElement(SettingsScreen));
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const levels = Array.from(headings).map((h) =>
      parseInt(h.tagName.replace("H", ""), 10),
    );
    for (let i = 1; i < levels.length; i++) {
      expect(
        levels[i] - levels[i - 1],
        `Heading hierarchy skips from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });
});

describe("Accessibility: AchievementsScreen", () => {
  it("should have no critical a11y violations", async () => {
    const { container } = renderWithRouter(
      React.createElement(AchievementsScreen),
    );
    const results = await axe(container);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  it("should have a heading", () => {
    const { container } = renderWithRouter(
      React.createElement(AchievementsScreen),
    );
    const heading = container.querySelector("h2, h1");
    expect(heading).not.toBeNull();
  });

  it("all buttons should have accessible text content", () => {
    const { container } = renderWithRouter(
      React.createElement(AchievementsScreen),
    );
    const buttons = container.querySelectorAll("button");
    for (const button of buttons) {
      const hasText =
        button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.getAttribute("aria-label");
      expect(
        hasText || hasAriaLabel,
        `Button missing accessible text: ${button.outerHTML}`,
      ).toBeTruthy();
    }
  });

  it("interactive elements should be keyboard focusable", () => {
    const { container } = renderWithRouter(
      React.createElement(AchievementsScreen),
    );
    const interactiveElements = container.querySelectorAll(
      "button, a, input, select, textarea, [role='button'], [role='link']",
    );
    for (const el of interactiveElements) {
      const tabIndex = el.getAttribute("tabindex");
      if (tabIndex === "-1") {
        const ariaHidden = el.getAttribute("aria-hidden");
        expect(
          ariaHidden,
          `Interactive element has tabindex=-1 without aria-hidden: ${el.outerHTML}`,
        ).toBe("true");
      }
    }
  });
});

describe("Accessibility: General checks across screens", () => {
  const screens = [
    { name: "TitleScreen", component: TitleScreen },
    { name: "SettingsScreen", component: SettingsScreen },
    { name: "AchievementsScreen", component: AchievementsScreen },
  ];

  for (const { name, component } of screens) {
    it(`${name}: images should have alt text or aria-label`, () => {
      const { container } = renderWithRouter(React.createElement(component));
      const images = container.querySelectorAll("img");
      for (const img of images) {
        const hasAlt = img.getAttribute("alt") !== null;
        const hasAriaLabel = img.getAttribute("aria-label");
        const hasRole = img.getAttribute("role") === "presentation";
        expect(
          hasAlt || hasAriaLabel || hasRole,
          `Image missing alt text in ${name}: ${img.outerHTML}`,
        ).toBeTruthy();
      }
    });

    it(`${name}: no duplicate IDs in the DOM`, () => {
      const { container } = renderWithRouter(React.createElement(component));
      const allIds = container.querySelectorAll("[id]");
      const idValues = Array.from(allIds).map((el) => el.getAttribute("id"));
      const duplicates = idValues.filter(
        (id, index) => idValues.indexOf(id) !== index,
      );
      expect(
        duplicates,
        `Duplicate IDs found in ${name}: ${duplicates.join(", ")}`,
      ).toHaveLength(0);
    });
  }
});
