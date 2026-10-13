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

export const serviceAreas = [
  {
    name: "Toronto",
    slug: "toronto",
    region: "Toronto, ON",
    title: "Electrician in Toronto, ON | Triple M Electric",
    description: "Looking for an electrician in Toronto? Triple M Electric provides licensed electrical repairs, installations, panel upgrades, lighting, and more across the city.",
    intro: "Triple M Electric provides residential, commercial, and industrial electrical services throughout Toronto. Our service is city-wide, so whether your property is downtown, midtown, North York, Scarborough, Etobicoke, or another Toronto neighbourhood, contact us about your project.",
    communities: ["Downtown Toronto", "Midtown", "North York", "Scarborough", "Etobicoke", "Toronto neighbourhoods city-wide"]
  },
  {
    name: "North York",
    slug: "north-york",
    region: "Toronto, ON",
    title: "Electrician in North York, ON | Triple M Electric",
    description: "Need an electrician in North York? Triple M Electric handles residential, commercial, and industrial electrical repairs, installations, and upgrades.",
    intro: "North York is part of Triple M Electric’s city-wide Toronto service area. We provide residential, commercial, and industrial electrical work, from troubleshooting and repairs to installations, lighting, and panel upgrades.",
    communities: ["Willowdale", "Don Mills", "Bayview Village", "Downsview", "York Mills"]
  },
  {
    name: "Vaughan",
    slug: "vaughan",
    region: "Vaughan, ON",
    title: "Electrician in Vaughan, ON | Triple M Electric",
    description: "Looking for a licensed electrician in Vaughan? Triple M Electric provides residential, commercial, and industrial electrical services.",
    intro: "Triple M Electric serves residential, commercial, and industrial properties across Vaughan. Contact us for electrical repairs, new installations, lighting, panel upgrades, and other project needs in the city.",
    communities: ["Concord", "Kleinburg", "Maple", "Thornhill", "Woodbridge"]
  },
  {
    name: "Richmond Hill",
    slug: "richmond-hill",
    region: "Richmond Hill, ON",
    title: "Electrician in Richmond Hill, ON | Triple M Electric",
    description: "Triple M Electric provides residential, commercial, and industrial electrical services in Richmond Hill, including repairs, installations, lighting, and panel upgrades.",
    intro: "Triple M Electric provides electrical services for homes, businesses, and industrial properties throughout Richmond Hill. Tell us about your project and location so our team can help plan the right next step.",
    communities: ["Oak Ridges", "Bayview Hill", "Langstaff", "Mill Pond", "Richvale"]
  },
  {
    name: "Markham",
    slug: "markham",
    region: "Markham, ON",
    title: "Electrician in Markham, ON | Triple M Electric",
    description: "Need an electrician in Markham? Triple M Electric offers licensed electrical repairs, installations, panel upgrades, lighting, and commercial services.",
    intro: "Triple M Electric serves residential, commercial, and industrial properties across Markham. Our team can discuss electrical troubleshooting, installations, lighting, panel upgrades, and ongoing maintenance for your property.",
    communities: ["Unionville", "Markham Village", "Thornhill", "Buttonville", "Cornell"]
  },
  {
    name: "Scarborough",
    slug: "scarborough",
    region: "Toronto, ON",
    title: "Electrician in Scarborough, Toronto | Triple M Electric",
    description: "Triple M Electric provides residential, commercial, and industrial electrical services throughout Scarborough, Toronto. Contact us for a quote.",
    intro: "Scarborough is included in Triple M Electric’s city-wide Toronto coverage. We help homeowners, businesses, and industrial properties with electrical repairs, installations, lighting, panel upgrades, and other electrical projects.",
    communities: ["Agincourt", "Wexford", "Malvern", "Birch Cliff", "Scarborough Town Centre"]
  },
  {
    name: "Etobicoke",
    slug: "etobicoke",
    region: "Toronto, ON",
    title: "Electrician in Etobicoke, Toronto | Triple M Electric",
    description: "Looking for an electrician in Etobicoke? Triple M Electric provides residential, commercial, and industrial electrical service across the area.",
    intro: "Etobicoke is part of Triple M Electric’s city-wide Toronto service area. We provide electrical repairs, installations, lighting, panel upgrades, and commercial or industrial support for properties across the area.",
    communities: ["Mimico", "Islington", "Rexdale", "The Kingsway", "Etobicoke Lakeshore"]
  },
  {
    name: "Mississauga",
    slug: "mississauga",
    region: "Mississauga, ON",
    title: "Electrician in Mississauga, ON | Triple M Electric",
    description: "Triple M Electric provides residential, commercial, and industrial electrical services in Mississauga, including repairs, installations, lighting, and panel upgrades.",
    intro: "Triple M Electric serves residential, commercial, and industrial properties across Mississauga. Contact us to discuss electrical repairs, installations, lighting, panel upgrades, or maintenance for your property.",
    communities: ["Port Credit", "Streetsville", "Meadowvale", "Erin Mills", "Cooksville"]
  }
];

export const services: ServiceItem[] = [
  {
    title: "Electrical Installations",
    slug: "electrical-installations",
    short: "Safe and code-compliant electrical installations for new and existing spaces.",
    description:
      "We provide complete electrical installations for homes and businesses, from planning and wiring to final setup with safety and quality as top priorities.",
    bullets: ["New wiring installations", "Fixture and outlet setup", "Dedicated circuit installation", "Code-compliant finishing"],
    audience: "Residential"
  },
  {
    title: "Electrical Repairs",
    slug: "electrical-repairs",
    short: "Fast diagnostics and dependable repairs for electrical issues.",
    description:
      "From recurring breaker trips to non-working outlets and lighting failures, our team diagnoses problems quickly and resolves them safely.",
    bullets: ["Troubleshooting and diagnostics", "Circuit and breaker repairs", "Outlet and switch repair", "Emergency repair support"],
    audience: "Residential"
  },
  {
    title: "Panel Upgrades",
    slug: "panel-upgrades",
    short: "Panel upgrades to support modern electrical demand.",
    description:
      "We upgrade outdated or overloaded electrical panels so your property can safely support current and future power needs.",
    bullets: ["Service panel replacement", "Breaker upgrades", "Load balancing", "Safety and code updates"],
    audience: "Residential"
  },
  {
    title: "Lighting Solutions",
    slug: "lighting-solutions",
    short: "Custom indoor and outdoor lighting with clean execution.",
    description:
      "Our lighting solutions improve comfort, visibility, and efficiency with designs tailored to your property and usage needs.",
    bullets: ["Interior lighting design", "Exterior and landscape lighting", "LED upgrades", "Smart lighting controls"],
    audience: "Residential"
  },
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
    title: "Electrical Maintenance",
    slug: "electrical-maintenance",
    short: "Preventive maintenance to reduce downtime and avoid failures.",
    description:
      "Routine electrical maintenance keeps your systems reliable and compliant while helping detect issues before they become costly disruptions.",
    bullets: ["Preventive maintenance plans", "Inspection and testing", "System performance checks", "Corrective recommendations"],
    audience: "Commercial"
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
