import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RsvpForm } from "./rsvp-form";

async function fillRequiredContactFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Jordan & Alex Rivera"), "Taylor Guest");
  await user.type(screen.getByPlaceholderText("you@email.com"), "taylor@example.com");
}

async function fillRequiredAttendingFields(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "2" }));
  await user.click(screen.getByRole("checkbox", { name: "Friday Welcome Party" }));
  await user.click(screen.getByRole("radio", { name: "Herb-Roasted Chicken" }));
  await user.click(screen.getByRole("radio", { name: "I'll make my own arrangements" }));
}

describe("RsvpForm", () => {
  it("associates the attending, meal preference, lodging preference, and guest count controls with their labels", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    expect(screen.getByRole("radiogroup", { name: "Will you be attending?" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));

    expect(screen.getByRole("combobox", { name: "Number of guests" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Meal preference" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Lodging preference" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Which events will you join?" })).toBeInTheDocument();
  });

  it("reveals the conditional fields only when attending is yes", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    expect(screen.queryByText("Number of guests")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    expect(screen.getByText("Number of guests")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));
    expect(screen.queryByText("Number of guests")).not.toBeInTheDocument();
  });

  it("blocks submission when attending yes without a meal preference, and shows no thank-you panel", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "2" }));
    await user.click(screen.getByRole("checkbox", { name: "Friday Welcome Party" }));
    await user.click(screen.getByRole("radio", { name: "I'll make my own arrangements" }));

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(await screen.findByText("Please select a meal preference.")).toBeInTheDocument();
    expect(screen.queryByText("We've got your RSVP.")).not.toBeInTheDocument();
  });

  it("shows the Zod validation message for a malformed email instead of relying on native browser validation", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await user.type(screen.getByPlaceholderText("Jordan & Alex Rivera"), "Taylor Guest");
    await user.type(screen.getByPlaceholderText("you@email.com"), "not-an-email");
    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("shows the celebrate message on a valid attending-yes submission", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    await fillRequiredAttendingFields(user);

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(await screen.findByText("We can't wait to celebrate with you!")).toBeInTheDocument();
  });

  it("shows the miss-you message on a valid attending-no submission, without requiring conditional fields", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    expect(
      await screen.findByText("We'll miss you — thank you for letting us know."),
    ).toBeInTheDocument();
  });

  it("returns to the form with prior values intact when editing the response", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Regretfully declines" }));
    await user.click(screen.getByRole("button", { name: "Send RSVP" }));

    await user.click(await screen.findByRole("button", { name: "Edit response" }));

    expect(screen.getByPlaceholderText("Jordan & Alex Rivera")).toHaveValue("Taylor Guest");
    expect(screen.getByPlaceholderText("you@email.com")).toHaveValue("taylor@example.com");
    expect(screen.getByRole("radio", { name: "Regretfully declines" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("returns to the form with attending-yes conditional values intact when editing the response", async () => {
    const user = userEvent.setup();
    render(<RsvpForm />);

    await fillRequiredContactFields(user);
    await user.click(screen.getByRole("radio", { name: "Joyfully accepts" }));
    await fillRequiredAttendingFields(user);

    await user.click(screen.getByRole("button", { name: "Send RSVP" }));
    await user.click(await screen.findByRole("button", { name: "Edit response" }));

    expect(screen.getByRole("radio", { name: "Joyfully accepts" })).toHaveAttribute(
      "data-state",
      "checked",
    );
    expect(screen.getByRole("radio", { name: "Herb-Roasted Chicken" })).toHaveAttribute(
      "data-state",
      "checked",
    );
    expect(screen.getByRole("radio", { name: "I'll make my own arrangements" })).toHaveAttribute(
      "data-state",
      "checked",
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("2");
  });
});
