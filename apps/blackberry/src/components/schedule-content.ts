export type ScheduleEvent = {
  day: string;
  dayColor: "blush" | "rose";
  time: string;
  title: string;
  description: string;
};

export const SCHEDULE_EYEBROW = "The Weekend";
export const SCHEDULE_HEADING = "Schedule of Events";
export const SCHEDULE_INTRO =
  "Three days in the North Georgia foothills. Here's the rhythm of the weekend — come to what you can, and don't stress the details. Final times will be confirmed closer to the date.";

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    day: "Friday · October 15",
    dayColor: "blush",
    time: "9:00 AM",
    title: "Club Hangout",
    description:
      "Come early to hang out, enjoy food, and spend the day by the pool or playing tennis and pickleball before the welcome party. Club location and details coming soon.",
  },
  {
    day: "Friday · October 15",
    dayColor: "blush",
    time: "4:00 PM",
    title: "Welcome Party",
    description:
      "Kick things off with drinks, bites & live music on the Villa patio under the bistro lights. Casual — come as you are.",
  },
  {
    day: "Saturday · October 16 · The Big Day",
    dayColor: "rose",
    time: "4:00 PM",
    title: "Ceremony",
    description:
      'We say "I do" in the garden by the fountain. Please arrive by 3:30 to find your seat.',
  },
  {
    day: "Saturday · October 16 · The Big Day",
    dayColor: "rose",
    time: "5:00 PM",
    title: "Cocktail Hour",
    description:
      "Signature cocktails & hors d'oeuvres on the patio while we sneak away for photos.",
  },
  {
    day: "Saturday · October 16 · The Big Day",
    dayColor: "rose",
    time: "6:30 PM",
    title: "Reception",
    description:
      "Dinner, toasts, cake & dancing in the Grand Hall until we send the night off at 11:00.",
  },
  {
    day: "Sunday · October 17",
    dayColor: "blush",
    time: "10:00 AM",
    title: "Farewell Brunch",
    description:
      "One more cup of coffee together before you head home. Drop by the Villa any time before noon.",
  },
];
