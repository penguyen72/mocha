import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloralBackground } from "./floral-background";

describe("FloralBackground", () => {
  it("renders the floral art as a decorative image", () => {
    const { container } = render(<FloralBackground />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(decodeURIComponent(img!.getAttribute("src") ?? "")).toContain(
      "/images/floral-background.png",
    );
  });
});
