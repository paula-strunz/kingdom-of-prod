import type { Metadata, Viewport } from "next";
import { IM_Fell_English, Literata, Silkscreen } from "next/font/google";
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

// A pixel face for short labels only: the light retro game finish.
const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-silkscreen",
});

const TITLE = "Kingdom of Prod";
const DESCRIPTION =
  "A 10-minute spooky autumn story game. Five strange problems, each a real product dilemma in disguise.";

// The icon and the link preview image are files in this folder (icon.svg, apple-icon.png,
// opengraph-image.png, twitter-image.png). Next adds their tags; see plan.md, section 8e.
export const metadata: Metadata = {
  metadataBase: new URL("https://kingdom-of-prod.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { type: "website", url: "/", siteName: TITLE, title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// `cover` lets the world run under the notch; the bar and the ground pad by the safe-area insets.
export const viewport: Viewport = { themeColor: "#150c1e", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fell.variable} ${literata.variable} ${silkscreen.variable}`}>
      <body>
        <Atmosphere />
        {children}
      </body>
    </html>
  );
}
