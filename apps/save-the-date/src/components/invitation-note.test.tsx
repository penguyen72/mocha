import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationNote } from "./invitation-note";
import { NOTE_TEXT } from "./invitation-content";

describe("InvitationNote", () => {
  it("says a formal invitation will follow", () => {
    render(<InvitationNote animated={false} />);
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it("offers no links now that guests are not asked for an address", () => {
    render(<InvitationNote animated={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
