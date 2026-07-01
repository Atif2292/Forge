export interface GymOption {
  id: string;
  name: string;
  city: string;
  priceRange: string;
  perks: string[];
  link: string;
}

export const gyms: GymOption[] = [
  {
    id: "cult-fit",
    name: "Cult.fit",
    city: "Pan-India (major metros)",
    priceRange: "~₹1,500–3,000/mo (indicative)",
    perks: ["Group workout classes", "App-based scheduling", "Combo plans with Cult diet/therapy"],
    link: "https://www.cult.fit",
  },
  {
    id: "anytime-fitness",
    name: "Anytime Fitness",
    city: "Pan-India franchise network",
    priceRange: "~₹2,000–4,000/mo (indicative)",
    perks: ["24/7 access", "Global gym access on premium plans", "Personal training add-ons"],
    link: "https://www.anytimefitness.com",
  },
  {
    id: "golds-gym",
    name: "Gold's Gym India",
    city: "Pan-India franchise network",
    priceRange: "~₹2,500–5,000/mo (indicative)",
    perks: ["Strength-focused equipment", "Certified trainers", "Powerlifting/bodybuilding culture"],
    link: "https://www.goldsgym.in",
  },
  {
    id: "talwalkars",
    name: "Talwalkars",
    city: "Pan-India, strong in West/North India",
    priceRange: "~₹1,800–3,500/mo (indicative)",
    perks: ["Long-standing Indian chain", "Group classes + gym floor", "Family membership options"],
    link: "https://www.talwalkars.net",
  },
  {
    id: "snap-fitness",
    name: "Snap Fitness",
    city: "Pan-India franchise network",
    priceRange: "~₹1,800–3,500/mo (indicative)",
    perks: ["24-hour keycard access", "Compact neighborhood locations", "Flexible short-term plans"],
    link: "https://www.snapfitness.com",
  },
];
