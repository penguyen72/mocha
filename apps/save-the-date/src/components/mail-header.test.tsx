import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MAIL_EYEBROW,
  MAIL_NAMES,
  OPEN_PROMPT_CLICK,
  OPEN_PROMPT_TAP,
} from "./invitation-content";
import { MailHeader, OpenPrompt } from "./mail-header";

describe("MailHeader", () => {
  it.each([false, true])("says who the mail is from (fading: %s)", (fading) => {
    render(<MailHeader fading={fading} />);
    expect(screen.getByText(MAIL_EYEBROW)).toBeInTheDocument();
    expect(screen.getByText(MAIL_NAMES)).toBeInTheDocument();
  });

  it("finishes the names with a decorative sprig", () => {
    const { container } = render(<MailHeader fading={false} />);
    const sprig = container.querySelector("[data-mail-sprig]");
    expect(sprig).not.toBeNull();
    expect(sprig).toHaveAttribute("aria-hidden", "true");
  });
});

describe("OpenPrompt", () => {
  it("carries both wordings; CSS shows the one that suits the visitor's pointer", () => {
    render(<OpenPrompt fading={false} />);
    expect(screen.getByText(OPEN_PROMPT_CLICK)).toBeInTheDocument();
    expect(screen.getByText(OPEN_PROMPT_TAP)).toBeInTheDocument();
  });
});
