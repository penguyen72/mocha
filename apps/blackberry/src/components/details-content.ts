export type RegistryLink = {
  label: string;
  href: string;
};

export const DETAILS_DRESS_EYEBROW = "What to Wear";
export const DETAILS_DRESS_HEADING = "Dress Code";
export const DETAILS_DRESS_EMPHASIS = "Garden Formal";
export const DETAILS_DRESS_BODY =
  "Suits and cocktail dresses, with florals encouraged to match the fall gardens.";
export const DETAILS_DRESS_FOOTNOTE =
  "A note on shoes: the ceremony is on grass & garden paths — block heels or flats will thank you.";
export const DETAILS_DRESS_SWATCHES = [
  "var(--bb-soft-white)",
  "var(--bb-soft-blush)",
  "var(--bb-intimate-pink)",
  "var(--bb-raindrops-on-roses)",
  "var(--bb-sugar-swizzle)",
];

export const DETAILS_REGISTRY_EYEBROW = "Gifts";
export const DETAILS_REGISTRY_HEADING = "Registry";
export const DETAILS_REGISTRY_BODY =
  "Your presence is the gift — truly. But if you'd like to help us feather the nest (and fund the honeymoon), we've put together a few things below.";

export const DETAILS_REGISTRY_LINKS: RegistryLink[] = [
  { label: "Crate & Barrel", href: "#rsvp" },
  { label: "Zola Registry", href: "#rsvp" },
  { label: "Honeymoon Fund", href: "#rsvp" },
];
