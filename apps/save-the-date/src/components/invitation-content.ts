/**
 * The single visually-hidden <h1> that carries the entire invitation for assistive
 * technology. The decorative card typography is aria-hidden precisely because this
 * heading already says all of it.
 */
export const INVITATION_HEADING =
  "Peyton & Liane are getting married. " +
  "Save the date: October 16, 2027, in Trenton, Georgia.";

export const ENVELOPE_LETTERING = "You’ve been invited";
export const ENVELOPE_PROMPT = "CLICK TO OPEN";
export const ENVELOPE_BUTTON_LABEL = "You’ve been invited. Open the envelope.";
export const SEAL_MONOGRAM = "P&L";

export const ANNOUNCEMENT_LINE_1 = "Peyton &";
export const ANNOUNCEMENT_LINE_2 = "Liane";
export const ANNOUNCEMENT_LINE_3 = "are getting";
export const ANNOUNCEMENT_LINE_4 = "married!";

/** The four announcement lines in reading order, for tests and for iteration. */
export const ANNOUNCEMENT_LINES = [
  ANNOUNCEMENT_LINE_1,
  ANNOUNCEMENT_LINE_2,
  ANNOUNCEMENT_LINE_3,
  ANNOUNCEMENT_LINE_4,
] as const;

export const DATE_CARD_SAVE = "Save";
export const DATE_CARD_THE = "the";
export const DATE_CARD_DATE = "Date";
export const DATE_CARD_LOCATION = "Trenton, Georgia";
export const DATE_CARD_NUMERALS = "10.16.2027";

/** Alt text for the couple photograph on the Polaroid card, verbatim from the design. */
export const PHOTO_ALT =
  "The couple smiling together outdoors among green trees, " +
  "with an engagement ring visible";

export const NOTE_LINE_1 = "formal invitation to follow, please";
export const NOTE_LINE_2 = "share your address with us";
export const NOTE_CTA_LABEL = "SHARE YOUR ADDRESS";
export const NOTE_CTA_HREF = "/share-your-address";
