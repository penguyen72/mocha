import { describe, expect, it } from "vitest";

import { rsvpFormSchema } from "./rsvp-schema";

const validBase = {
  fullName: "Jordan Rivera",
  email: "jordan@example.com",
};

describe("rsvpFormSchema", () => {
  it("succeeds when declining, without any conditional fields", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, attending: "no" });
    expect(result.success).toBe(true);
  });

  it("fails when attending without a meal preference", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "2",
      events: ["Friday Welcome Party"],
      lodgingPreference: "Making my own arrangements",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "mealPreference")).toBe(true);
    }
  });

  it("fails when attending without a guest count, events, or lodging preference", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, attending: "yes" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toEqual(
        expect.arrayContaining(["guestCount", "events", "mealPreference", "lodgingPreference"]),
      );
    }
  });

  it("succeeds when attending with every required field present", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "2",
      events: ["Friday Welcome Party"],
      mealPreference: "Herb-Roasted Chicken",
      lodgingPreference: "Making my own arrangements",
    });
    expect(result.success).toBe(true);
  });

  it("succeeds when attending with dietary restrictions, song request, and message omitted", () => {
    const result = rsvpFormSchema.safeParse({
      ...validBase,
      attending: "yes",
      guestCount: "1",
      events: ["Sunday Farewell Brunch"],
      mealPreference: "Wild Mushroom Risotto (V)",
      lodgingPreference: "Downtown Chattanooga hotel",
    });
    expect(result.success).toBe(true);
  });

  it("fails on a malformed email", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, email: "not-an-email", attending: "no" });
    expect(result.success).toBe(false);
  });

  it("fails on a blank name", () => {
    const result = rsvpFormSchema.safeParse({ ...validBase, fullName: "   ", attending: "no" });
    expect(result.success).toBe(false);
  });
});
