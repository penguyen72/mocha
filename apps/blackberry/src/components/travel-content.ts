export type TravelIconItem = {
  icon: string;
  title: string;
  description: string;
};

export const TRAVEL_EYEBROW = "Getting Here";
export const TRAVEL_HEADING = "Travel & Directions";
export const TRAVEL_INTRO =
  "The Villa at Blackberry Ridge sits in the foothills of Trenton, Georgia — tucked between " +
  "Chattanooga and Atlanta. It's an easy drive from either, and the countryside on the way is " +
  "half the fun.";

export const TRAVEL_ICON_ITEMS: TravelIconItem[] = [
  {
    icon: "✈",
    title: "By air",
    description:
      "Chattanooga (CHA) is 45 min away; Atlanta (ATL) is ~2 hrs and has more direct flights. " +
      "Rental car recommended either way.",
  },
  {
    icon: "⌁",
    title: "By car",
    description:
      "Just off Hwy 301 in Trenton, GA. Free on-site parking — carpooling encouraged for the " +
      "welcome party.",
  },
  {
    icon: "✦",
    title: "Shuttle",
    description:
      "A shuttle will run between the downtown Chattanooga hotel block and the Villa on " +
      "Saturday. Details to come.",
  },
];

export const TRAVEL_ADDRESS_LINE_1 = "625 Hwy 301 S";
export const TRAVEL_ADDRESS_LINE_2 = "Trenton, GA 30752";
