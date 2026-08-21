import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("selects one option and reports it as checked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="option-a">Option A</RadioGroupItem>
        <RadioGroupItem value="option-b">Option B</RadioGroupItem>
      </RadioGroup>,
    );

    const accept = screen.getByRole("radio", { name: "Option A" });
    await user.click(accept);

    expect(onValueChange).toHaveBeenCalledWith("option-a");
    expect(accept).toHaveAttribute("data-state", "checked");
  });
});
