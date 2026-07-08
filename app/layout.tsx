import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://triplemelectric.ca"),
  title: "Triple M Electric | Licensed Electricians in Toronto & GTA",
  description:
    "Residential, commercial, and industrial electrical services across Toronto and the GTA by certified, licensed electricians.",
  icons: {
    icon: "/1-846635ab.ico",
    shortcut: "/1-846635ab.ico",
    apple: "/1-846635ab.ico"
  },
  openGraph: {
    title: "Triple M Electric",
    description: "Modern electrical services across Toronto and the GTA.",
    url: "https://triplemelectric.ca",
    siteName: "Triple M Electric",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-midnight text-sand antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
