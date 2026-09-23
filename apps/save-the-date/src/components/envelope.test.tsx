import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Envelope } from "./envelope";
import {
  ENVELOPE_BUTTON_LABEL,
  ENVELOPE_LETTERING,
  ENVELOPE_PROMPT,
  SEAL_MONOGRAM,
} from "./invitation-content";

describe("Envelope", () => {
  it("renders the lettering, the prompt, the monogram and the open button when closed", () => {
    render(<Envelope phase="closed" onOpen={vi.fn()} />);
    expect(screen.getByText(ENVELOPE_LETTERING)).toBeInTheDocument();
    expect(screen.getByText(ENVELOPE_PROMPT)).toBeInTheDocument();
    expect(screen.getByText(SEAL_MONOGRAM)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL })).toBeInTheDocument();
  });

  it("calls onOpen when the envelope button is activated", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const onOpen = vi.fn();
    render(<Envelope phase="closed" onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: ENVELOPE_BUTTON_LABEL }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps the seal visible but removes the button while opening", () => {
    render(<Envelope phase="opening" onOpen={vi.fn()} />);
    expect(screen.getByText(SEAL_MONOGRAM)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
  });

  it("drops the seal layer entirely once open", () => {
    render(<Envelope phase="open" onOpen={vi.fn()} />);
    expect(screen.queryByText(SEAL_MONOGRAM)).not.toBeInTheDocument();
    expect(screen.queryByText(ENVELOPE_PROMPT)).not.toBeInTheDocument();
    expect(screen.getByText(ENVELOPE_LETTERING)).toBeInTheDocument();
  });
});
