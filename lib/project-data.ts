export type Project = {
  title: string;
  location: string;
  areaSlug?: string;
  description: string;
  photos: { src: string; alt: string }[];
};

export const projects: Project[] = [
  {
    title: "Washer receptacle and dedicated circuit",
    location: "York, Toronto",
    areaSlug: "toronto",
    description: "Installed a washer receptacle at the client’s designated location, added a dedicated circuit, tested the receptacle, and labelled the breakers.",
    photos: [
      { src: "/projects/washer-receptacle-york-toronto-1.jpeg", alt: "Electrical panel and labelled breakers for a washer circuit in York, Toronto" },
      { src: "/projects/washer-receptacle-york-toronto-2.jpeg", alt: "Washer receptacle electrical work in York, Toronto" },
      { src: "/projects/washer-receptacle-york-toronto-3.jpeg", alt: "Dedicated circuit installation for a washer in York, Toronto" }
    ]
  },
  {
    title: "Pot light installation",
    location: "Scarborough",
    areaSlug: "scarborough",
    description: "Installed recessed pot lights to add practical, even lighting to the space.",
    photos: [
      { src: "/projects/pot-lights-scarborough-1.jpeg", alt: "Pot light installation project in Scarborough" },
      { src: "/projects/pot-lights-scarborough-2.jpeg", alt: "Recessed lighting work in a Scarborough home" }
    ]
  },
  {
    title: "Power for a sump pump",
    location: "Toronto",
    areaSlug: "toronto",
    description: "Installed an electrical power connection for a sump pump.",
    photos: [{ src: "/projects/sump-pump-power-toronto-1.jpeg", alt: "Electrical work to provide power for a sump pump in Toronto" }]
  },
  {
    title: "Garage lighting installation",
    location: "Mississauga",
    areaSlug: "mississauga",
    description: "Installed new lighting in a building garage.",
    photos: [
      { src: "/projects/garage-lighting-mississauga-1.jpeg", alt: "Garage lighting installation in Mississauga" },
      { src: "/projects/garage-lighting-mississauga-2.jpeg", alt: "Electrical lighting work in a Mississauga building garage" }
    ]
  },
  {
    title: "Lighting fixtures in a pre-construction condo",
    location: "York, Toronto",
    areaSlug: "toronto",
    description: "Installed lighting fixtures as part of a pre-construction condominium project.",
    photos: [
      { src: "/projects/condo-lighting-york-toronto-1.jpeg", alt: "Lighting fixture installation in a York, Toronto condominium" },
      { src: "/projects/condo-lighting-york-toronto-2.jpeg", alt: "Electrical installation work in a pre-construction condo in York, Toronto" },
      { src: "/projects/condo-lighting-york-toronto-3.jpeg", alt: "Installed lighting fixtures in a Toronto condo project" }
    ]
  },
  {
    title: "Pot light installation",
    location: "North York",
    areaSlug: "north-york",
    description: "Installed recessed pot lights for updated room lighting.",
    photos: [
      { src: "/projects/pot-lights-north-york-1.jpeg", alt: "Pot light installation in North York" },
      { src: "/projects/pot-lights-north-york-2.jpeg", alt: "Recessed lights installed in a North York property" }
    ]
  },
  {
    title: "Stove receptacle troubleshooting",
    location: "Whitby",
    description: "Troubleshot an issue with a stove receptacle.",
    photos: [{ src: "/projects/stove-receptacle-troubleshooting-whitby-1.jpeg", alt: "Stove receptacle troubleshooting project in Whitby" }]
  },
  {
    title: "Chandelier installation in a high-ceiling home",
    location: "Toronto",
    areaSlug: "toronto",
    description: "Installed a chandelier in a custom home with a high ceiling.",
    photos: [
      { src: "/projects/chandelier-installation-toronto-1.jpeg", alt: "Chandelier installation in a high-ceiling Toronto home" },
      { src: "/projects/chandelier-installation-toronto-2.jpeg", alt: "Electrical lighting work for a custom Toronto home" }
    ]
  },
  {
    title: "Light fixture replacement",
    location: "Scarborough",
    areaSlug: "scarborough",
    description: "Replaced two existing light fixtures, each controlled by its own switch.",
    photos: [
      { src: "/projects/light-fixture-replacement-scarborough-1.jpeg", alt: "Replacement light fixture installation in Scarborough" },
      { src: "/projects/light-fixture-replacement-scarborough-2.jpeg", alt: "Two separately switched light fixtures replaced in Scarborough" }
    ]
  }
];
