import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FORMA — Interior Design Studio",
  description:
    "Award-winning interior design studio crafting timeless spaces. Residential and commercial projects across Europe and the Middle East.",
  keywords: "luxury interior design, bespoke interiors, residential design, commercial interiors",
  openGraph: {
    title: "FORMA — Interior Design Studio",
    description: "Spaces that tell your story.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-linen text-espresso antialiased">{children}</body>
    </html>
  );
}
