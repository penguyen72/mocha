import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnnouncementCard } from "./announcement-card";
import { ANNOUNCEMENT_LINES } from "./invitation-content";

describe("AnnouncementCard", () => {
  it("renders every announcement line", () => {
    render(<AnnouncementCard animated={false} />);
    for (const line of ANNOUNCEMENT_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("renders the same lines while animating", () => {
    render(<AnnouncementCard animated />);
    for (const line of ANNOUNCEMENT_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });
});
