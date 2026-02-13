import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIM Tracker Pro",
    short_name: "SIM Tracker",
    description: "Retail SIM tracking and sales intelligence dashboard",
    start_url: "/login",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/next.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}

