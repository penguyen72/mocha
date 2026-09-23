import type { AddressFormValues } from "./address-schema";

/** The pause the design prototype used between submit and its result. */
export const SUBMIT_DELAY_MS = 1400;

/**
 * The single seam where a real submission endpoint or form provider gets connected.
 *
 * Nothing is stored or sent today. This resolves after the same delay the design
 * prototype used, so the Sending -> Success transition is real rather than instant, and
 * it takes the submitted values so that wiring a backend here needs no signature change.
 *
 * The form's error state is driven by this promise rejecting. Until a real endpoint
 * exists it never does, so `error` is reachable only from a test that makes this reject
 * — see address-form.test.tsx. Do not add a guard here to fake that: `addressFormSchema`
 * trims and requires `name` and `address`, and react-hook-form only calls the submit
 * handler with parsed, valid values, so any such guard would be dead code that reads
 * like a real failure mode.
 */
export async function submitAddress(values: AddressFormValues): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, SUBMIT_DELAY_MS);
  });

  // Referencing the payload keeps the seam honest: this is the value a real endpoint
  // would send, and it is deliberately going nowhere today.
  void values;
}
