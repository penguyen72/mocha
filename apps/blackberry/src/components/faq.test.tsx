import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Faq } from "./faq";
import { FAQ_HEADING, FAQ_ITEMS } from "./faq-content";

describe("Faq", () => {
  it("renders the heading and every question, with answers collapsed by default", () => {
    render(<Faq />);
    expect(screen.getByRole("heading", { level: 2, name: FAQ_HEADING })).toBeInTheDocument();
    for (const item of FAQ_ITEMS) {
      expect(screen.getByRole("button", { name: item.question })).toBeInTheDocument();
      expect(screen.queryByText(item.answer)).not.toBeInTheDocument();
    }
  });

  it("reveals an answer when its question is clicked, and collapses the previous one", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const [first, second] = FAQ_ITEMS;

    await user.click(screen.getByRole("button", { name: first.question }));
    expect(screen.getByText(first.answer)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: second.question }));
    expect(screen.getByText(second.answer)).toBeInTheDocument();
    expect(screen.queryByText(first.answer)).not.toBeInTheDocument();
  });
});
