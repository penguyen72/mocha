import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { submitAddress } from "./address-submit";

const ENDPOINT_ENV = "NEXT_PUBLIC_FORMSPREE_ENDPOINT";
const ENDPOINT = "https://formspree.io/f/abcdefgh";

const VALUES = {
  name: "Jordan Avery",
  email: "jordan@example.com",
  address: "1428 Magnolia Lane, Apt 3B\nChattanooga, TN 37402\nUnited States",
};

/** A minimal stand-in for the parts of Response that submitAddress actually reads. */
function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function stubFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("submitAddress", () => {
  beforeEach(() => {
    vi.stubEnv(ENDPOINT_ENV, ENDPOINT);
    // submitAddress logs the real cause for the site owner; keep test output readable.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the submission to the configured endpoint as JSON", async () => {
    const fetchMock = stubFetch(async () => jsonResponse({ next: "https://formspree.io/thanks" }));

    await expect(submitAddress(VALUES)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe("POST");
    expect(init.mode).toBe("cors");
    expect(init.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      name: VALUES.name,
      email: VALUES.email,
      address: VALUES.address,
    });
  });

  it("throws without calling fetch when the endpoint is not configured", async () => {
    vi.stubEnv(ENDPOINT_ENV, "");
    const fetchMock = stubFetch(async () => jsonResponse({ next: "ok" }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The contract detail that matters most: Formspree reports validation failures in the
  // body, with a 200. Checking response.ok alone would report success to the guest.
  it("throws when an error-shaped body arrives with a 200", async () => {
    stubFetch(async () =>
      jsonResponse({
        errors: [{ message: "Email is required", code: "REQUIRED_FIELD_EMPTY", field: "email" }],
      }),
    );

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws on a single-error body", async () => {
    stubFetch(async () => jsonResponse({ error: "Form not found" }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws on a non-2xx status", async () => {
    stubFetch(async () => jsonResponse({ next: "ok" }, 500));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws when the request never completes", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws when the response body is not JSON", async () => {
    stubFetch(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError("Unexpected token < in JSON");
          },
        }) as unknown as Response,
    );

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("accepts a body whose errors key is not Formspree-shaped but carries a success token", async () => {
    // Faithful to the reference client: `[42]` fails its error predicate, and `next`
    // is present, so this is a success.
    stubFetch(async () => jsonResponse({ next: "ok", errors: [42] }));

    await expect(submitAddress(VALUES)).resolves.toBeUndefined();
  });

  // An empty errors array satisfies the reference client's `every()` and carries no
  // success token, so it is a failure. Pins the choice, which is otherwise invisible.
  it("throws on an empty errors array", async () => {
    stubFetch(async () => jsonResponse({ errors: [] }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  // Acceptance requires the success token, not merely the absence of errors. Without
  // this, an unrecognised 200 would be reported to the guest as delivered.
  it("throws on a 200 with no success token", async () => {
    stubFetch(async () => jsonResponse({}));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws on a mixed errors array that matches neither predicate", async () => {
    stubFetch(async () => jsonResponse({ errors: [{ message: "bad" }, { code: "OTHER" }] }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
  });

  it("throws when the endpoint variable is absent rather than empty", async () => {
    vi.stubEnv(ENDPOINT_ENV, undefined);
    const fetchMock = stubFetch(async () => jsonResponse({ next: "ok" }));

    await expect(submitAddress(VALUES)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs Formspree's own messages for the site owner instead of rendering them", async () => {
    stubFetch(async () => jsonResponse({ error: "Form not found" }, 404));

    await expect(submitAddress(VALUES)).rejects.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("HTTP 404"),
      ["Form not found"],
    );
  });
});
