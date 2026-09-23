import { z } from "zod";

import { ADDRESS_EMAIL_ERROR, ADDRESS_MAILING_ERROR, ADDRESS_NAME_ERROR } from "./address-content";

/** The design prototype's own email rule, kept verbatim so validation matches it exactly. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addressFormSchema = z.object({
  name: z.string().trim().min(1, ADDRESS_NAME_ERROR),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || EMAIL_PATTERN.test(value), ADDRESS_EMAIL_ERROR),
  address: z.string().trim().min(1, ADDRESS_MAILING_ERROR),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
