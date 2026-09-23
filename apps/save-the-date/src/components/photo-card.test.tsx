import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PHOTO_ALT } from "./invitation-content";
import { PhotoCard } from "./photo-card";

describe("PhotoCard", () => {
  it("renders a placeholder without claiming to be the photograph", () => {
    const { container } = render(<PhotoCard animated={false} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByAltText(PHOTO_ALT)).not.toBeInTheDocument();
  });
});
