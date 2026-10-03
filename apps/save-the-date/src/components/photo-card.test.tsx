import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PHOTO_ALT, PHOTO_CAPTION } from "./invitation-content";
import { PhotoCard } from "./photo-card";

describe("PhotoCard", () => {
  it("renders the couple photograph with its alt text", () => {
    render(<PhotoCard animated={false} />);
    const img = screen.getByAltText(PHOTO_ALT);
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/images/couple-photo.jpg");
  });

  it.each([false, true])("writes the caption on the Polaroid strip (animated: %s)", (animated) => {
    render(<PhotoCard animated={animated} />);
    expect(screen.getByText(PHOTO_CAPTION)).toBeInTheDocument();
  });

  it("comes out of the envelope already developed and captioned", () => {
    const { container } = render(<PhotoCard animated />);
    expect(screen.getByAltText(PHOTO_ALT).className).not.toMatch(/animation/);
    expect(screen.getByText(PHOTO_CAPTION).parentElement?.className).not.toMatch(/animation|mask/);
    expect(container.querySelectorAll("[class*='develop']")).toHaveLength(0);
  });
});
