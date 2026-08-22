import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Travel } from "./travel";
import {
  TRAVEL_ADDRESS_LINE_1,
  TRAVEL_ADDRESS_LINE_2,
  TRAVEL_HEADING,
  TRAVEL_ICON_ITEMS,
} from "./travel-content";

describe("Travel", () => {
  it("renders the heading and every travel item's title and description", () => {
    render(<Travel />);
    expect(screen.getByRole("heading", { level: 2, name: TRAVEL_HEADING })).toBeInTheDocument();
    for (const item of TRAVEL_ICON_ITEMS) {
      expect(screen.getByRole("heading", { level: 3, name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it("renders the venue address", () => {
    render(<Travel />);
    expect(screen.getByText(TRAVEL_ADDRESS_LINE_1)).toBeInTheDocument();
    expect(screen.getByText(TRAVEL_ADDRESS_LINE_2)).toBeInTheDocument();
  });
});
