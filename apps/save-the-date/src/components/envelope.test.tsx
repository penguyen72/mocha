import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Envelope } from "./envelope";
import {
  ENVELOPE_BUTTON_LABEL,
  ENVELOPE_LETTERING,
  ENVELOPE_PROMPT,
  POSTMARK_CITY,
  POSTMARK_DATE,
  SEAL_MONOGRAM,
} from "./invitation-content";

const sealSrc = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("img"))
    .map((img) => decodeURIComponent(img.getAttribute("src") ?? ""))
    .find((src) => src.includes("/images/wax-seal.png"));

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

  it("stamps the city and date on the sealed envelope", () => {
    render(<Envelope phase="closed" onOpen={vi.fn()} />);
    expect(screen.getByText(POSTMARK_CITY)).toBeInTheDocument();
    expect(screen.getByText(POSTMARK_DATE)).toBeInTheDocument();
  });

  it("keeps the cracking seal visible but removes the button while opening", () => {
    render(<Envelope phase="opening" onOpen={vi.fn()} />);
    // The seal cracks into two halves, each carrying its half of the monogram.
    expect(screen.getAllByText(SEAL_MONOGRAM)).toHaveLength(2);
    expect(screen.queryByRole("button", { name: ENVELOPE_BUTTON_LABEL })).not.toBeInTheDocument();
  });

  it("drops the seal layer entirely once open", () => {
    render(<Envelope phase="open" onOpen={vi.fn()} />);
    expect(screen.queryByText(SEAL_MONOGRAM)).not.toBeInTheDocument();
    expect(screen.queryByText(ENVELOPE_PROMPT)).not.toBeInTheDocument();
    expect(screen.queryByText(POSTMARK_CITY)).not.toBeInTheDocument();
    expect(screen.getByText(ENVELOPE_LETTERING)).toBeInTheDocument();
  });
  it.each(["closed", "opening"] as const)("renders the wax-seal image while %s", (phase) => {
    const { container } = render(<Envelope phase={phase} onOpen={vi.fn()} />);
    expect(sealSrc(container)).toBeDefined();
  });

  it("removes the wax-seal image once open", () => {
    const { container } = render(<Envelope phase="open" onOpen={vi.fn()} />);
    expect(sealSrc(container)).toBeUndefined();
  });
});
