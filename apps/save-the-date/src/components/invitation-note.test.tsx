import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InvitationNote } from "./invitation-note";
import { CALENDAR_HREF, CALENDAR_LABEL, NOTE_TEXT, REPLAY_LABEL } from "./invitation-content";

describe("InvitationNote", () => {
  it("says a formal invitation will follow", () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument();
  });

  it("offers the date as a calendar file", () => {
    render(<InvitationNote animated={false} onReplay={vi.fn()} />);
    expect(screen.getByRole("link", { name: CALENDAR_LABEL })).toHaveAttribute(
      "href",
      CALENDAR_HREF,
    );
  });

  it("replays the invitation on request", async () => {
    const onReplay = vi.fn();
    render(<InvitationNote animated={false} onReplay={onReplay} />);
    await userEvent.click(screen.getByRole("button", { name: REPLAY_LABEL }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});
