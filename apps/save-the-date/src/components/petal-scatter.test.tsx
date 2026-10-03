import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PetalScatter } from "./petal-scatter";

describe("PetalScatter", () => {
  it("only renders petals that are falling — none sit still on the invitation", () => {
    const { container } = render(<PetalScatter />);
    const petals = container.querySelectorAll("[data-petal]");
    expect(petals.length).toBeGreaterThanOrEqual(12);
    for (const petal of petals) {
      expect(petal.className).toMatch(/--std-anim-fall-\d+/);
    }
  });
});
