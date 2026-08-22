export type PartyMember = {
  name: string;
  role: string;
  for: "Liane" | "Peyton";
};

export const PARTY_EYEBROW = "By Our Side";
export const PARTY_HEADING = "The Wedding Party";
export const PARTY_INTRO =
  "The people who've had our backs long before this weekend — and who'll be standing with us when it counts.";

export const PARTY_MEMBERS: PartyMember[] = [
  { name: "Maya Chen", role: "Maid of Honor", for: "Liane" },
  { name: "Priya Anand", role: "Bridesmaid", for: "Liane" },
  { name: "Sofia Reyes", role: "Bridesmaid", for: "Liane" },
  { name: "Grace Okoro", role: "Bridesmaid", for: "Liane" },
  { name: "Daniel Cole", role: "Best Man", for: "Peyton" },
  { name: "Marcus Webb", role: "Groomsman", for: "Peyton" },
  { name: "Eli Nakamura", role: "Groomsman", for: "Peyton" },
  { name: "Theo Brandt", role: "Groomsman", for: "Peyton" },
];
