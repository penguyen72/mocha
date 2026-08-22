import { z } from "zod";

export const EVENT_OPTIONS = [
  "Friday Welcome Party",
  "Saturday Ceremony & Reception",
  "Sunday Farewell Brunch",
] as const;

export const MEAL_OPTIONS = [
  "Herb-Roasted Chicken",
  "Braised Short Rib",
  "Pan-Seared Salmon",
  "Wild Mushroom Risotto (V)",
] as const;

export const GUEST_COUNT_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const LODGING_OPTIONS = [
  { label: "Staying on the estate", value: "On the estate (Yorkshire Manor & cottages)" },
  { label: "Booking a Chattanooga hotel", value: "Downtown Chattanooga hotel" },
  { label: "I'll make my own arrangements", value: "Making my own arrangements" },
] as const;

const LODGING_VALUES = LODGING_OPTIONS.map((option) => option.value) as [string, ...string[]];

const rsvpBaseSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address."),
  attending: z.enum(["yes", "no"], {
    error: "Please let us know if you can make it.",
  }),
  guestCount: z.enum(GUEST_COUNT_OPTIONS).optional(),
  events: z.array(z.enum(EVENT_OPTIONS)).optional(),
  mealPreference: z.enum(MEAL_OPTIONS).optional(),
  dietaryRestrictions: z.string().trim().optional(),
  lodgingPreference: z.enum(LODGING_VALUES).optional(),
  songRequest: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export const rsvpFormSchema = rsvpBaseSchema.superRefine((data, ctx) => {
  if (data.attending !== "yes") return;

  if (!data.guestCount) {
    ctx.addIssue({
      path: ["guestCount"],
      code: z.ZodIssueCode.custom,
      message: "Please select a guest count.",
    });
  }
  if (!data.events || data.events.length === 0) {
    ctx.addIssue({
      path: ["events"],
      code: z.ZodIssueCode.custom,
      message: "Please select at least one event.",
    });
  }
  if (!data.mealPreference) {
    ctx.addIssue({
      path: ["mealPreference"],
      code: z.ZodIssueCode.custom,
      message: "Please select a meal preference.",
    });
  }
  if (!data.lodgingPreference) {
    ctx.addIssue({
      path: ["lodgingPreference"],
      code: z.ZodIssueCode.custom,
      message: "Please select a lodging preference.",
    });
  }
});

export type RsvpFormValues = z.infer<typeof rsvpBaseSchema>;
