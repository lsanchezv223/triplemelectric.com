export type ServiceItem = {
  title: string;
  slug: string;
  short: string;
  description: string;
  bullets: string[];
  audience: "Residential" | "Commercial" | "Industrial";
};

export const contactInfo = {
  phone: "+1 (289) 923-3541",
  email: "info@triplemelectric.ca",
  address: "809-5 Old Sheppard Ave, North York, ON M2J 4K3",
  license: "Electrical Contractors License 7015049"
};

export const services: ServiceItem[] = [
  {
    title: "Interior & Exterior Lighting",
    slug: "electrical-lighting",
    short: "Lighting design and installation for safer, brighter spaces.",
    description:
      "From pot lights to outdoor fixtures, we design and install practical lighting systems with a clean finish and reliable electrical work.",
    bullets: ["Pot light installation", "Outdoor landscape lighting", "Lighting retrofits", "Smart switch upgrades"],
    audience: "Residential"
  },
  {
    title: "Commercial Lighting",
    slug: "commercial-lighting",
    short: "Energy-efficient commercial lighting for offices and retail.",
    description:
      "Lighting systems designed for performance, comfort, and code compliance with minimal downtime for your business operations.",
    bullets: ["LED conversion", "Emergency lighting", "Maintenance programs", "Lighting controls"],
    audience: "Commercial"
  },
  {
    title: "Panel Upgrades & Rewiring",
    slug: "electrical-upgrades",
    short: "Safe electrical capacity upgrades for growing demand.",
    description:
      "We modernize old electrical systems and service panels to improve safety, avoid overloads, and support today's appliances and EV chargers.",
    bullets: ["Breaker panel replacement", "Whole-home rewiring", "Code corrections", "Load calculations"],
    audience: "Residential"
  },
  {
    title: "EV Charger Installation",
    slug: "ev-charger-installation",
    short: "Level 2 EV charger setup for homes and businesses.",
    description:
      "We install EV charging solutions with proper circuit protection, clean routing, and future-ready electrical planning.",
    bullets: ["Level 2 charger wiring", "Dedicated circuits", "Permit-ready installs", "Commercial EV plans"],
    audience: "Commercial"
  },
  {
    title: "Data & Communication Lines",
    slug: "data-communication-lines",
    short: "Structured cabling and low-voltage power integration.",
    description:
      "Reliable cable routing and electrical support for data rooms, office expansion, and network-heavy environments.",
    bullets: ["Data line routing", "Server room electrical prep", "Cable organization", "Expansion support"],
    audience: "Commercial"
  },
  {
    title: "Industrial Electrical Support",
    slug: "industrial-services",
    short: "Maintenance and upgrades for industrial operations.",
    description:
      "We support production facilities with preventive maintenance, equipment wiring, and emergency-response electrical troubleshooting.",
    bullets: ["Preventive maintenance", "Machinery wiring", "Troubleshooting", "Emergency service 24/7"],
    audience: "Industrial"
  }
];

export const portfolio = [
  {
    title: "Residential Pot Lights",
    type: "Residential",
    summary: "42 fixture upgrade with dimmable zones and smart control integration."
  },
  {
    title: "Retail LED Retrofit",
    type: "Commercial",
    summary: "Full LED conversion reducing estimated lighting energy costs by 38%."
  },
  {
    title: "Warehouse Power Upgrade",
    type: "Industrial",
    summary: "New panel distribution and load balancing for equipment expansion."
  }
];
