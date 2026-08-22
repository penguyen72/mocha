import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="you@email.com" />);
    const input = screen.getByPlaceholderText("you@email.com");
    await user.type(input, "guest@example.com");
    expect(input).toHaveValue("guest@example.com");
  });
});
