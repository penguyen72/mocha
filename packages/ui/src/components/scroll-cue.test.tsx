import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScrollCue } from "./scroll-cue";

function setScroll(scrollY: number, innerHeight: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
}

describe("ScrollCue", () => {
  afterEach(() => {
    setScroll(0, 768);
  });

  it("is visible before the page has scrolled", () => {
    setScroll(0, 768);
    render(<ScrollCue label="Scroll" />);

    expect(screen.getByText("Scroll")).toBeInTheDocument();
  });

  it("hides once the page has scrolled past the threshold", () => {
    setScroll(0, 768);
    render(<ScrollCue label="Scroll" />);

    expect(screen.getByText("Scroll")).toBeInTheDocument();

    act(() => {
      setScroll(200, 768);
      fireEvent.scroll(window);
    });

    expect(screen.queryByText("Scroll")).not.toBeInTheDocument();
  });
});
