import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Stay } from "./stay";
import { DOWNTOWN_HOTELS, ESTATE_HOTELS, STAY_HEADING } from "./stay-content";

describe("Stay", () => {
  it("renders the heading and estate hotels by default", () => {
    render(<Stay />);
    expect(screen.getByRole("heading", { level: 2, name: STAY_HEADING })).toBeInTheDocument();
    for (const hotel of ESTATE_HOTELS) {
      expect(screen.getByRole("heading", { level: 3, name: hotel.name })).toBeInTheDocument();
    }
    expect(screen.queryByText(DOWNTOWN_HOTELS[0].name)).not.toBeInTheDocument();
  });

  it("switches to downtown hotels when that tab is selected", async () => {
    const user = userEvent.setup();
    render(<Stay />);

    await user.click(screen.getByRole("tab", { name: "Downtown Chattanooga" }));

    for (const hotel of DOWNTOWN_HOTELS) {
      expect(screen.getByRole("heading", { level: 3, name: hotel.name })).toBeInTheDocument();
    }
    expect(screen.queryByText(ESTATE_HOTELS[0].name)).not.toBeInTheDocument();
  });
});
