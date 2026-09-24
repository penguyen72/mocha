import type { AddressFormValues } from "./address-schema";

const ENDPOINT_ENV = "NEXT_PUBLIC_FORMSPREE_ENDPOINT";

/**
 * Formspree reports failures in the response body rather than only through the HTTP
 * status — its own client (@formspree/core@4.0.0) never inspects `response.ok`.
 *
 * This mirrors that client's error predicate exactly: an `errors` array whose every
 * entry has a string `message`, or a single string `error`. An empty `errors` array
 * satisfies `every` and so counts as a failure here too, which is the safe direction —
 * it carries no success token.
 *
 * Returns the messages when the body is a Formspree failure, or null when it is not.
 */
function readFormspreeErrors(body: unknown): string[] | null {
  if (body === null || typeof body !== "object") return null;

  if ("errors" in body) {
    const { errors } = body as { errors: unknown };
    const isFormspreeErrorList =
      Array.isArray(errors) &&
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
 * Formspree's success body carries a `next` redirect URL. The reference client treats a
 * body that is neither error-shaped nor `next`-shaped as "Unexpected response format" —
 * an error, not a success — so acceptance requires this token rather than merely the
 * absence of errors. That is what stops a `{}` or a half-recognised body from being
 * reported to a guest as delivered.
 */
function hasFormspreeSuccessToken(body: unknown): boolean {
  if (body === null || typeof body !== "object") return false;
  return "next" in body && typeof (body as { next: unknown }).next === "string";
}

/**
 * Sends a guest's mailing address to the Formspree form configured by
 * NEXT_PUBLIC_FORMSPREE_ENDPOINT. Resolves only when Formspree accepted it; throws
 * otherwise, which is what drives the form's error state.
 *
 * Every failure path throws rather than resolving. Reporting success when nothing was
 * sent would tell a guest their address arrived when it did not, so anything
 * unrecognised is treated as a failure.
 *
 * Formspree's own error text is logged for the site owner and never rendered — it is
 * written for a developer, not a wedding guest.
 */
export async function submitAddress(values: AddressFormValues): Promise<void> {
  // Read per call, not at module scope: a module-scope read is frozen at import and
  // cannot be stubbed in tests. Next inlines NEXT_PUBLIC_* inside function bodies too.
  //
  // This must stay a literal member access. Next's inlining is syntactic, so rewriting
  // it to process.env[ENDPOINT_ENV] would leave every test green — Vitest has a real
  // process.env — while the browser bundle got `undefined` and the form errored forever.
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    console.error(
      `submitAddress: ${ENDPOINT_ENV} is not set, so the address was not sent. ` +
        "Set it to https://formspree.io/f/<form id> in the Vercel project, then redeploy — " +
        "NEXT_PUBLIC_* values are baked into the client bundle at build time.",
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

  if (!response.ok) {
    console.error(
      `submitAddress: Formspree rejected the submission (HTTP ${response.status}).`,
      readFormspreeErrors(body) ?? body,
    );
    throw new Error("Formspree rejected the address submission.");
  }

  const errors = readFormspreeErrors(body);
  if (errors !== null) {
    console.error(
      `submitAddress: Formspree reported errors despite HTTP ${response.status}.`,
      errors.length > 0 ? errors : body,
    );
    throw new Error("Formspree rejected the address submission.");
  }

  if (!hasFormspreeSuccessToken(body)) {
    console.error(
      `submitAddress: Formspree returned an unrecognised body (HTTP ${response.status}); ` +
        "treating it as a failure rather than reporting success.",
      body,
    );
    throw new Error("The address submission response was not recognised.");
  }
}
