import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TabSwitch } from "./tab-switch";

describe("TabSwitch", () => {
  it("renders all tab labels and swaps the visible panel on click", async () => {
    const user = userEvent.setup();
    render(
      <TabSwitch
        tabs={[
          { id: "a", label: "Tab A", panel: <p>Panel A</p> },
          { id: "b", label: "Tab B", panel: <p>Panel B</p> },
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Tab A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab B" })).toBeInTheDocument();
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Tab B" }));

    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });
});
