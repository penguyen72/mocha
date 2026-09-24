import type { AddressFormValues } from "./address-schema";

const ENDPOINT_ENV = "NEXT_PUBLIC_FORMSPREE_ENDPOINT";

/**
 * Formspree reports failures in the response body rather than only through the HTTP
 * status — its own client (@formspree/core@4.0.0) never inspects `response.ok`. This
 * mirrors that client's predicate: an `errors` array whose every entry has a string
 * `message`, or a single string `error`.
 *
 * Returns the messages when the body is a Formspree failure, or null when it is not.
 */
function readFormspreeErrors(body: unknown): string[] | null {
  if (body === null || typeof body !== "object") return null;

  if ("errors" in body) {
    const { errors } = body as { errors: unknown };
    const isFormspreeErrorList =
      Array.isArray(errors) &&
      errors.length > 0 &&
      errors.every(
        (entry) =>
          entry !== null &&
          typeof entry === "object" &&
          typeof (entry as { message?: unknown }).message === "string",
      );

    if (isFormspreeErrorList) {
      return (errors as { message: string }[]).map((entry) => entry.message);
    }
  }

  if ("error" in body) {
    const { error } = body as { error: unknown };
    if (typeof error === "string") return [error];
  }

  return null;
}

/**
 * Sends a guest's mailing address to the Formspree form configured by
 * NEXT_PUBLIC_FORMSPREE_ENDPOINT. Resolves only when Formspree accepted it; throws
 * otherwise, which is what drives the form's error state.
 *
 * Every failure path throws rather than resolving. Reporting success when nothing was
 * sent would tell a guest their address arrived when it did not.
 *
 * Formspree's own error text is logged for the site owner and never rendered — it is
 * written for a developer, not a wedding guest.
 */
export async function submitAddress(values: AddressFormValues): Promise<void> {
  // Read per call, not at module scope: a module-scope read is frozen at import and
  // cannot be stubbed in tests. Next inlines NEXT_PUBLIC_* inside function bodies too.
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    console.error(
      `submitAddress: ${ENDPOINT_ENV} is not set, so the address was not sent. ` +
        "Set it to https://formspree.io/f/<form id> in the Vercel project.",
    );
    throw new Error(`${ENDPOINT_ENV} is not configured.`);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        address: values.address,
      }),
    });
  } catch (cause) {
    console.error("submitAddress: the request to Formspree never completed.", cause);
    throw new Error("The address submission request failed.", { cause });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    console.error(
      `submitAddress: Formspree returned a response that was not JSON (HTTP ${response.status}).`,
      cause,
    );
    throw new Error("The address submission response could not be read.", { cause });
  }

  const errors = readFormspreeErrors(body);

  if (!response.ok || errors !== null) {
    console.error(
      `submitAddress: Formspree rejected the submission (HTTP ${response.status}).`,
      errors ?? body,
    );
    throw new Error("Formspree rejected the address submission.");
  }
}
