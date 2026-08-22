import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Explore } from "./explore";
import { EXPLORE_HEADING, EXPLORE_TABS } from "./explore-content";

const chattanooga = EXPLORE_TABS.find((tab) => tab.id === "chattanooga")!;
const atlanta = EXPLORE_TABS.find((tab) => tab.id === "atlanta")!;

describe("Explore", () => {
  it("renders the heading and Chattanooga activities by default", () => {
    render(<Explore />);
    expect(screen.getByRole("heading", { level: 2, name: EXPLORE_HEADING })).toBeInTheDocument();
    for (const activity of chattanooga.activities) {
      expect(screen.getByRole("heading", { level: 3, name: activity.name })).toBeInTheDocument();
    }
    expect(screen.queryByText(atlanta.activities[0].name)).not.toBeInTheDocument();
  });

  it("switches to Atlanta activities when that tab is selected", async () => {
    const user = userEvent.setup();
    render(<Explore />);

    await user.click(screen.getByRole("tab", { name: atlanta.label }));

    for (const activity of atlanta.activities) {
      expect(screen.getByRole("heading", { level: 3, name: activity.name })).toBeInTheDocument();
    }
    expect(screen.queryByText(chattanooga.activities[0].name)).not.toBeInTheDocument();
  });
});
