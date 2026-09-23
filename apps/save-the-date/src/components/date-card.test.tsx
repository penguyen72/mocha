import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DateCard } from "./date-card";
import {
  DATE_CARD_DATE,
  DATE_CARD_LOCATION,
  DATE_CARD_NUMERALS,
  DATE_CARD_SAVE,
  DATE_CARD_THE,
} from "./invitation-content";

describe("DateCard", () => {
  it("renders the save-the-date wording, the location and the date", () => {
    render(<DateCard animated={false} />);
    expect(screen.getByText(DATE_CARD_SAVE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_THE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_DATE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_LOCATION)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_NUMERALS)).toBeInTheDocument();
  });
});
