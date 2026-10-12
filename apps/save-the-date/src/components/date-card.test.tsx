import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DateCard } from "./date-card";
import {
  DATE_CARD_DATE,
  DATE_CARD_LOCATION,
  DATE_CARD_MONTH,
  DATE_CARD_SAVE,
  DATE_CARD_THE,
  DATE_CARD_WEEK,
} from "./invitation-content";
import { SongProvider } from "./song";

describe("DateCard", () => {
  it.each([false, true])("renders the wording, the wedding week and the city (animated: %s)", (animated) => {
    render(
      <SongProvider>
        <DateCard animated={animated} />
      </SongProvider>,
    );
    expect(screen.getByText(DATE_CARD_SAVE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_THE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_DATE)).toBeInTheDocument();
    expect(screen.getByText(DATE_CARD_MONTH)).toBeInTheDocument();
    for (const day of DATE_CARD_WEEK) {
      expect(screen.getByText(String(day))).toBeInTheDocument();
    }
    expect(screen.getByText(DATE_CARD_LOCATION)).toBeInTheDocument();
  });
});
