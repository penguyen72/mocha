import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationNote } from "./invitation-note";
import { NOTE_CTA_HREF, NOTE_CTA_LABEL, NOTE_LINE_1, NOTE_LINE_2 } from "./invitation-content";

describe("InvitationNote", () => {
  it("renders both lines of the note", () => {
    render(<InvitationNote animated={false} />);
    expect(screen.getByText(NOTE_LINE_1)).toBeInTheDocument();
    expect(screen.getByText(NOTE_LINE_2)).toBeInTheDocument();
  });

  it("links to the address page", () => {
    render(<InvitationNote animated={false} />);
    expect(screen.getByRole("link", { name: NOTE_CTA_LABEL })).toHaveAttribute(
      "href",
      NOTE_CTA_HREF,
    );
  });
});
