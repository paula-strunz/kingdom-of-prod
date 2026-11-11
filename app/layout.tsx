import type { Metadata, Viewport } from "next";
import { IM_Fell_English, Literata } from "next/font/google";
import type { ReactNode } from "react";
import { Atmosphere } from "../src/design/Atmosphere";
import "./globals.css";

// Storybook display face for titles.
const fell = IM_Fell_English({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fell",
});

// A book face designed for long, comfortable reading on screens.
const literata = Literata({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-literata",
});

export const metadata: Metadata = {
  title: "Kingdom of Prod",
  description:
    "A 10-minute spooky autumn story game. Five strange problems, each a real product dilemma in disguise.",
};

export const viewport: Viewport = { themeColor: "#150c1e" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fell.variable} ${literata.variable}`}>
      <body>
        <Atmosphere />
        {children}
      </body>
    </html>
  );
}
