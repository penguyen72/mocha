import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PHOTO_ALT } from "./invitation-content";
import { PhotoCard } from "./photo-card";

describe("PhotoCard", () => {
  it("renders the couple photograph with its alt text", () => {
    render(<PhotoCard animated={false} />);
    const img = screen.getByAltText(PHOTO_ALT);
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain("/images/couple-photo.jpg");
  });
});
