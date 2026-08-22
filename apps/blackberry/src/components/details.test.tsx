import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Details } from "./details";
import {
  DETAILS_DRESS_EMPHASIS,
  DETAILS_DRESS_HEADING,
  DETAILS_REGISTRY_HEADING,
  DETAILS_REGISTRY_LINKS,
} from "./details-content";

describe("Details", () => {
  it("renders the dress code heading and emphasis line", () => {
    render(<Details />);
    expect(
      screen.getByRole("heading", { level: 2, name: DETAILS_DRESS_HEADING }),
    ).toBeInTheDocument();
    expect(screen.getByText(DETAILS_DRESS_EMPHASIS)).toBeInTheDocument();
  });

  it("renders every registry link with its href", () => {
    render(<Details />);
    expect(
      screen.getByRole("heading", { level: 2, name: DETAILS_REGISTRY_HEADING }),
    ).toBeInTheDocument();
    for (const link of DETAILS_REGISTRY_LINKS) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute("href", link.href);
    }
  });
});
