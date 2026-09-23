import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ADDRESS_BACK_LABEL,
  ADDRESS_CLOSING_LINE_1,
  ADDRESS_FIELD_HELP,
  ADDRESS_FIELD_LABEL,
  ADDRESS_EMAIL_ERROR,
  ADDRESS_EMAIL_LABEL,
  ADDRESS_MAILING_ERROR,
  ADDRESS_NAME_ERROR,
  ADDRESS_NAME_LABEL,
  ADDRESS_SENDING_LABEL,
  ADDRESS_SUBMIT_ERROR,
  ADDRESS_SUBMIT_LABEL,
  ADDRESS_SUCCESS_BODY,
  ADDRESS_SUCCESS_HEADING,
  INVITATION_HREF,
} from "./address-content";
import { AddressForm } from "./address-form";

vi.mock("./address-submit", () => ({
  SUBMIT_DELAY_MS: 0,
  submitAddress: vi.fn(async () => {}),
}));

const { submitAddress } = await import("./address-submit");

afterEach(() => {
  vi.mocked(submitAddress).mockReset();
  vi.mocked(submitAddress).mockImplementation(async () => {});
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(ADDRESS_NAME_LABEL), "Jordan Avery");
  await user.type(screen.getByLabelText(ADDRESS_FIELD_LABEL), "1428 Magnolia Lane, TN 37402");
}

describe("AddressForm", () => {
  it("renders the fields, the help text and the back link", () => {
    render(<AddressForm />);
    expect(screen.getByLabelText(ADDRESS_NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(ADDRESS_FIELD_LABEL)).toBeInTheDocument();
    expect(screen.getByText(ADDRESS_FIELD_HELP)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: ADDRESS_BACK_LABEL })).toHaveAttribute(
      "href",
      INVITATION_HREF,
    );
  });

  it("surfaces validation messages and sends nothing when the form is empty", async () => {
    const user = userEvent.setup();
    render(<AddressForm />);

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    expect(await screen.findByText(ADDRESS_NAME_ERROR)).toBeInTheDocument();
    expect(screen.getByText(ADDRESS_MAILING_ERROR)).toBeInTheDocument();
    expect(submitAddress).not.toHaveBeenCalled();
  });

  it("submits and shows the success panel", async () => {
    const user = userEvent.setup();
    render(<AddressForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    expect(
      await screen.findByRole("heading", { level: 2, name: ADDRESS_SUCCESS_HEADING }),
    ).toBeInTheDocument();
    expect(screen.getByText(ADDRESS_SUCCESS_BODY)).toBeInTheDocument();
    expect(submitAddress).toHaveBeenCalledTimes(1);
  });

  it("hides the closing line once the submission has succeeded", async () => {
    const user = userEvent.setup();
    render(<AddressForm />);
    expect(screen.getByText(ADDRESS_CLOSING_LINE_1)).toBeInTheDocument();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    await waitFor(() => {
      expect(screen.queryByText(ADDRESS_CLOSING_LINE_1)).not.toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: ADDRESS_BACK_LABEL })).toBeInTheDocument();
  });

  it("shows the error alert when the submission rejects", async () => {
    vi.mocked(submitAddress).mockRejectedValueOnce(new Error("network"));
    const user = userEvent.setup();
    render(<AddressForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(ADDRESS_SUBMIT_ERROR);
    expect(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL })).toBeEnabled();
  });
  it("rejects a malformed email without sending anything", async () => {
    const user = userEvent.setup();
    render(<AddressForm />);
    await fillValidForm(user);
    await user.type(screen.getByLabelText(ADDRESS_EMAIL_LABEL, { exact: false }), "jordan@");

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    expect(await screen.findByText(ADDRESS_EMAIL_ERROR)).toBeInTheDocument();
    expect(submitAddress).not.toHaveBeenCalled();
  });

  it("shows the sending state and blocks a second submit while in flight", async () => {
    let release: () => void = () => {};
    vi.mocked(submitAddress).mockImplementationOnce(
      () => new Promise<void>((resolve) => { release = resolve; }),
    );
    const user = userEvent.setup();
    render(<AddressForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    const sendingButton = await screen.findByRole("button", { name: ADDRESS_SENDING_LABEL });
    expect(sendingButton).toBeDisabled();
    expect(sendingButton).toHaveAttribute("aria-disabled", "true");
    expect(submitAddress).toHaveBeenCalledTimes(1);

    release();
    expect(
      await screen.findByRole("heading", { level: 2, name: ADDRESS_SUCCESS_HEADING }),
    ).toBeInTheDocument();
  });

  it("moves focus to the success heading so a keyboard user is not stranded", async () => {
    const user = userEvent.setup();
    render(<AddressForm />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: ADDRESS_SUBMIT_LABEL }));

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: ADDRESS_SUCCESS_HEADING,
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });
  });
});
