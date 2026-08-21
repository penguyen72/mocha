import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("accepts typed text", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Can't wait to celebrate with you both!" />);
    const textarea = screen.getByPlaceholderText("Can't wait to celebrate with you both!");
    await user.type(textarea, "So excited!");
    expect(textarea).toHaveValue("So excited!");
  });
});
