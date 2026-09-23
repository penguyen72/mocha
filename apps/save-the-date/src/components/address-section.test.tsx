import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ADDRESS_BACK_LABEL,
  ADDRESS_CLOSING_LINE_1,
  ADDRESS_CLOSING_LINE_2,
  ADDRESS_PAGE_HEADING,
  INVITATION_HREF,
} from "./address-content";
import { AddressSection } from "./address-section";

describe("AddressSection", () => {
  it("renders the page heading as the only level-1 heading", () => {
    render(<AddressSection />);
    expect(
      screen.getByRole("heading", { level: 1, name: ADDRESS_PAGE_HEADING }),
    ).toBeInTheDocument();
  });

  it("renders the closing line and a link back to the invitation", () => {
    render(<AddressSection />);
    expect(screen.getByText(ADDRESS_CLOSING_LINE_1)).toBeInTheDocument();
    expect(screen.getByText(ADDRESS_CLOSING_LINE_2)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: ADDRESS_BACK_LABEL })).toHaveAttribute(
      "href",
      INVITATION_HREF,
    );
  });
});
