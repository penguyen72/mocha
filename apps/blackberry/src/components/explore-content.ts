export type ExploreActivity = {
  name: string;
  description: string;
};

export type ExploreTab = {
  id: string;
  label: string;
  activities: ExploreActivity[];
};

export const EXPLORE_EYEBROW = "Make a Trip of It";
export const EXPLORE_HEADING = "Things to Do";
export const EXPLORE_INTRO =
  "Two great cities bookend the venue. A few of our favorite ways to spend the extra hours, whether you fly into Chattanooga or Atlanta.";

export const EXPLORE_TABS: ExploreTab[] = [
  {
    id: "chattanooga",
    label: "Chattanooga · 30 min",
    activities: [
      {
        name: "Lookout Mountain",
        description:
          "Ruby Falls, Rock City & the Incline Railway — see seven states from the overlook.",
      },
      {
        name: "Tennessee Aquarium",
        description: "One of the best in the country, right on the revitalized downtown riverfront.",
      },
      {
        name: "Walnut Street Bridge",
        description: "Stroll the historic pedestrian bridge and the Riverwalk at golden hour.",
      },
      {
        name: "Bluff View Art District",
        description: "Cobblestone streets, gardens, galleries and café pastries above the river.",
      },
      {
        name: "Downtown Dining",
        description: "From St. John's to Main Street Meats — Chattanooga's food scene punches up.",
      },
      {
        name: "Coolidge Park",
        description: "Antique carousel, riverfront lawns and easy afternoons on the North Shore.",
      },
    ],
  },
  {
    id: "atlanta",
    label: "Atlanta · 2 hrs",
    activities: [
      {
        name: "Georgia Aquarium",
        description: "The largest in the Western Hemisphere — whale sharks and all.",
      },
      {
        name: "Ponce City Market",
        description: "Food hall, rooftop games and shops in a landmark Beltline building.",
      },
      {
        name: "The Atlanta BeltLine",
        description: "Walk or bike the Eastside Trail past murals, breweries and parks.",
      },
      {
        name: "Piedmont Park",
        description: "Atlanta's green heart, with skyline views and the Botanical Garden next door.",
      },
      {
        name: "World of Coca-Cola",
        description: "A only-in-Atlanta classic beside the Civil Rights Center downtown.",
      },
      {
        name: "Historic Sweet Auburn",
        description: "The MLK Jr. National Historical Park and the soul of the city.",
      },
    ],
  },
];
