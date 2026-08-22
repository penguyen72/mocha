export type Hotel = {
  tag: string;
  name: string;
  description: string;
};

export const STAY_EYEBROW = "Where to Stay";
export const STAY_HEADING = "Accommodations";
export const STAY_INTRO =
  "Make a weekend of it. Stay right on the estate, or settle into downtown Chattanooga " +
  "(about 30 minutes north). Mention the Liane & Peyton wedding block when you book.";

export const ESTATE_HOTELS: Hotel[] = [
  {
    tag: "On-site · Flagship",
    name: "Yorkshire Manor",
    description:
      "The grand manor on the estate — the heart of our room block. Sleeps a large group " +
      "with elegant shared spaces.",
  },
  {
    tag: "On-site",
    name: "Cotswold Manor",
    description:
      "A second European-style manor steps from the Villa. Warm, characterful rooms for " +
      "family and close friends.",
  },
  {
    tag: "On-site · Suite",
    name: "Blackberry Tower",
    description:
      "A private 3-bedroom tower tucked in the trees with a lakeside dock — sleeps up to 8.",
  },
  {
    tag: "On-site · Cozy",
    name: "The Cottage",
    description: "A charming garden cottage for a quiet, romantic stay right on the grounds.",
  },
];

export const DOWNTOWN_HOTELS: Hotel[] = [
  {
    tag: "~30 min · Historic",
    name: "The Read House",
    description:
      "A 1920s downtown landmark near the Tennessee Aquarium. Our recommended hotel block — " +
      "timeless and central.",
  },
  {
    tag: "~30 min · Modern",
    name: "The Westin Chattanooga",
    description:
      "Rooftop bar with Lookout Mountain views, heated pool, and boutique shopping in the " +
      "West Village.",
  },
  {
    tag: "~30 min · Boutique",
    name: "Hotel Indigo Downtown",
    description:
      "A stylish boutique stay in the heart of downtown, walkable to the riverfront and " +
      "restaurants.",
  },
  {
    tag: "~30 min · B&B",
    name: "Mayor's Mansion Inn",
    description:
      "An 1889 mansion turned intimate bed & breakfast in the Fort Wood historic district. " +
      "Romantic and quiet.",
  },
];
