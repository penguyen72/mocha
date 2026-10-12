/**
 * The single visually-hidden <h1> that carries the entire invitation for assistive
 * technology. The decorative card typography is aria-hidden precisely because this
 * heading already says all of it.
 */
export const INVITATION_HEADING =
  "Peyton & Liane are getting married. " +
  "Save the date: October 16, 2027, in Trenton, Georgia.";

/** Above the sealed envelope: who the mail is from. */
export const MAIL_EYEBROW = "You have mail from";
export const MAIL_NAMES = "Peyton & Liane";

/** Below the sealed envelope; the wording follows the visitor's pointer. */
export const OPEN_PROMPT_CLICK = "Click the envelope to open";
export const OPEN_PROMPT_TAP = "Tap the envelope to open";

export const ENVELOPE_BUTTON_LABEL = "Open the envelope";

/** The postmark stamped onto the sealed envelope: the city and date, before it is even opened. */
export const POSTMARK_CITY = "TRENTON, GA";
export const POSTMARK_DATE = "10.16.27";

export const ANNOUNCEMENT_LINE_1 = "Peyton";
export const ANNOUNCEMENT_LINE_2 = "&";
export const ANNOUNCEMENT_LINE_3 = "Liane";
/** Set in small spaced capitals on the card, like "October 2027" on the date card. */
export const ANNOUNCEMENT_LINE_4 = "are getting married";

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
export const DATE_CARD_MONTH = "October 2027";
/** The wedding week, Sunday to Saturday; the last day is circled with a hand-drawn heart. */
export const DATE_CARD_WEEK = [10, 11, 12, 13, 14, 15, 16] as const;
export const DATE_CARD_DAY = 16;

/** The couple's song, played by the record on the date card from the app's own public folder. */
export const SONG_SRC = "/dream.m4a";
export const SONG_TITLE = "Dream";
export const SONG_ARTIST = "Suzy & Baekhyun";
export const RECORD_PLAY_LABEL = `Play ${SONG_TITLE} by ${SONG_ARTIST}`;
export const RECORD_PAUSE_LABEL = `Pause ${SONG_TITLE} by ${SONG_ARTIST}`;
/** Curved beneath the record, like the hint on a jukebox card. */
export const RECORD_HINT_PLAY = "Tap to play";
export const RECORD_HINT_PAUSE = "Tap to pause";

/** Alt text for the couple photograph on the Polaroid card, verbatim from the design. */
export const PHOTO_ALT =
  "The couple smiling together outdoors among green trees, " +
  "with an engagement ring visible";

/** Handwritten on the Polaroid's bottom strip, followed by a small drawn heart. */
export const PHOTO_CAPTION = "just us";

export const NOTE_TEXT = "Formal invitation to follow";

/**
 * The moment the countdown runs to: midnight in Trenton, Georgia (Eastern Daylight Time)
 * as the wedding day begins. Set this to the ceremony time once it is known.
 */
export const WEDDING_START = "2027-10-16T00:00:00-04:00";

export const COUNTDOWN_EYEBROW = "The countdown is on!";
export const COUNTDOWN_TODAY = "Today’s the day!";

export const CALENDAR_LABEL = "Add to calendar";
/**
 * Served from the app's own origin. Opened directly, Apple devices offer to add the one
 * event; a webcal: link would subscribe the guest to a whole new calendar instead.
 */
export const CALENDAR_HREF = "/peyton-and-liane.ics";
export const CALENDAR_FILE_NAME = "peyton-and-liane.ics";

/** The calendar sheet's header: a small date tile beside the event's title and details. */
export const CALENDAR_SHEET_TITLE = "Peyton & Liane's Wedding";
export const CALENDAR_SHEET_DATE = "Saturday, October 16, 2027";
export const CALENDAR_SHEET_PLACE = "Trenton, Georgia";
export const CALENDAR_SHEET_WHEN = `${CALENDAR_SHEET_DATE} · ${CALENDAR_SHEET_PLACE}`;
export const CALENDAR_TILE_MONTH = "Oct";
export const CALENDAR_DISMISS = "Not now";

/** One row per calendar in the sheet: what it is, and what choosing it will do. */
export const CALENDAR_CHOICES = {
  google: { name: "Google Calendar", hint: "Opens in a new tab" },
  apple: { name: "Apple Calendar", hint: "iPhone, iPad & Mac" },
  file: { name: "Outlook & others", hint: "Download an .ics file" },
} as const;
/** An all-day event uses an exclusive end date, matching the static .ics file. */
export const GOOGLE_CALENDAR_HREF =
  "https://calendar.google.com/calendar/r/eventedit?" +
  new URLSearchParams({
    action: "TEMPLATE",
    dates: "20271016/20271017",
    text: "Peyton & Liane's Wedding",
    location: "Trenton, Georgia",
    details: "Save the date! Formal invitation to follow.",
  }).toString();
export const REPLAY_LABEL = "Open again";
