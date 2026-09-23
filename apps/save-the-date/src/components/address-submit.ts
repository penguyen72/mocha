import type { AddressFormValues } from "./address-schema";

/** The pause the design prototype used between submit and its result. */
export const SUBMIT_DELAY_MS = 1400;

/**
 * The single seam where a real submission endpoint or form provider gets connected.
 *
 * Nothing is stored or sent today — this resolves after the same delay the design
 * prototype used, so the Sending -> Success transition is real rather than instant.
 * The form's error state is driven by this promise rejecting, so wiring a real backend
 * here is the only change needed to make the whole status machine live.
 */
export async function submitAddress(values: AddressFormValues): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, SUBMIT_DELAY_MS);
  });

  if (!values.name.trim() || !values.address.trim()) {
    throw new Error("Address submission is missing required fields.");
  }
}
