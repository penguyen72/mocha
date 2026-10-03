import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloralBackground } from "./floral-background";

const floralSrc = (img: Element) => decodeURIComponent(img.getAttribute("src") ?? "");

describe("FloralBackground", () => {
  it("renders the floral art as a decorative image", () => {
    const { container } = render(<FloralBackground />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(floralSrc(img!)).toContain("/images/floral-background.png");
  });

  it("shows the whole frame: the art's top half pinned to the top, its bottom half to the bottom", () => {
    const { container } = render(<FloralBackground />);
    const halves = Array.from(container.querySelectorAll("[data-floral-half]"));
    expect(halves.map((half) => half.getAttribute("data-floral-half"))).toEqual(["top", "bottom"]);
    for (const half of halves) {
      const img = half.querySelector("img");
      expect(img).toHaveAttribute("alt", "");
      expect(floralSrc(img!)).toContain("/images/floral-background.png");
    }
  });
});
