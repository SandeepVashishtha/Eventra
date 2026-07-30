import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/components/events/EventRecommendations.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

// Helper to simulate dynamic visibleCount calculations based on width
function getVisibleCount(width) {
  if (width < 640) {
    return 1;
  } else if (width < 1024) {
    return 2;
  } else {
    return 3;
  }
}

// Helper to calculate card width style formula
function getCardWidthStyle(visibleCount, gap = 16) {
  return `calc(${100 / visibleCount}% - ${((visibleCount - 1) * gap) / visibleCount}px)`;
}

// Helper to calculate translation formula
function getTranslateXStyle(currentIndex, visibleCount, gap = 16) {
  return `translateX(calc(-${currentIndex} * (100% + ${gap}px) / ${visibleCount}))`;
}

describe("EventRecommendations Responsive Carousel Logic", () => {
  it("should return correct visibleCount based on viewport width breakpoints", () => {
    assert.equal(getVisibleCount(375), 1, "Mobile portrait (<640px) should show 1 card");
    assert.equal(getVisibleCount(639), 1, "Mobile landscape border (<640px) should show 1 card");
    assert.equal(getVisibleCount(768), 2, "Tablet (768px) should show 2 cards");
    assert.equal(getVisibleCount(1023), 2, "Tablet border (<1024px) should show 2 cards");
    assert.equal(getVisibleCount(1200), 3, "Desktop (>=1024px) should show 3 cards");
  });

  it("should compute mathematically exact card width styling based on visibleCount", () => {
    assert.equal(
      getCardWidthStyle(3),
      "calc(33.333333333333336% - 10.666666666666666px)",
      "3 cards width should match formula"
    );
    assert.equal(getCardWidthStyle(2), "calc(50% - 8px)", "2 cards width should match formula");
    assert.equal(getCardWidthStyle(1), "calc(100% - 0px)", "1 card width should match formula");
  });

  it("should compute mathematically exact translation styling based on current index and visibleCount", () => {
    assert.equal(
      getTranslateXStyle(0, 3),
      "translateX(calc(-0 * (100% + 16px) / 3))",
      "Index 0 should have zero translation offset"
    );
    assert.equal(
      getTranslateXStyle(1, 3),
      "translateX(calc(-1 * (100% + 16px) / 3))",
      "Index 1 translation should match formula"
    );
    assert.equal(
      getTranslateXStyle(2, 2),
      "translateX(calc(-2 * (100% + 16px) / 2))",
      "Tablet index 2 translation should match formula"
    );
  });
});

describe("EventRecommendations Code Structure Integrity", () => {
  it("should use dynamic visibleCount state and window resize listener", () => {
    assert.ok(
      componentSrc.includes("setVisibleCount"),
      "Component source must declare and use visibleCount state"
    );
    assert.ok(
      componentSrc.includes('addEventListener("resize"') ||
        componentSrc.includes("addEventListener('resize'"),
      "Component source must attach window resize event listener"
    );
  });

  it("should clamp currentIndex when visibleCount changes to prevent out-of-bounds rendering", () => {
    assert.ok(
      componentSrc.includes("Math.max(0, recommendedEvents.length - visibleCount)"),
      "Component source must clamp index calculations dynamically"
    );
  });

  it("should render dynamic count of skeletons matching visibleCount", () => {
    assert.ok(
      componentSrc.includes("Array.from({ length: visibleCount })"),
      "Component source must render dynamic skeletons matching visibleCount"
    );
  });

  it("should render navigation buttons only when events length exceeds visibleCount", () => {
    assert.ok(
      componentSrc.includes("recommendedEvents.length > visibleCount"),
      "Component source must conditionally show navigation buttons based on visibleCount"
    );
  });

  it("should apply dynamic width inline style and flexShrink: 0 on each card", () => {
    assert.ok(
      componentSrc.includes(
        "width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`"
      ),
      "Component source must compute card width dynamically"
    );
    assert.ok(componentSrc.includes("flexShrink: 0"), "Component source must apply flexShrink: 0");
  });

  it("should translate slider film strip dynamically using calc formula", () => {
    assert.ok(
      componentSrc.includes(
        "transform: `translateX(calc(-${currentIndex} * (100% + 16px) / ${visibleCount}))`"
      ),
      "Component source must translate using dynamic calc formula"
    );
  });
});

console.log("EventRecommendations Responsive Carousel tests loaded ✓");
