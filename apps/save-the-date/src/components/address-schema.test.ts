import { describe, expect, it } from "vitest";

import {
  ADDRESS_EMAIL_ERROR,
  ADDRESS_MAILING_ERROR,
  ADDRESS_NAME_ERROR,
} from "./address-content";
import { addressFormSchema } from "./address-schema";

const VALID = {
  name: "Jordan Avery",
  email: "jordan@example.com",
  address: "1428 Magnolia Lane, Apt 3B\nChattanooga, TN 37402\nUnited States",
};

function errorFor(values: Record<string, string>, field: string) {
  const result = addressFormSchema.safeParse(values);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("addressFormSchema", () => {
  it("accepts a complete submission", () => {
    expect(addressFormSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepts a blank email, because email is optional", () => {
    expect(addressFormSchema.safeParse({ ...VALID, email: "" }).success).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(errorFor({ ...VALID, name: "   " }, "name")).toBe(ADDRESS_NAME_ERROR);
  });

  it("rejects a blank mailing address", () => {
    expect(errorFor({ ...VALID, address: "  " }, "address")).toBe(ADDRESS_MAILING_ERROR);
  });

  it("rejects a malformed email", () => {
    expect(errorFor({ ...VALID, email: "jordan@" }, "email")).toBe(ADDRESS_EMAIL_ERROR);
  });
});
