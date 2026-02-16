import type { Metadata } from "next";
import { Inter, Cinzel, Metal_Mania } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-metal-mania",
});

export const metadata: Metadata = {
  title: "LotSync",
  description:
    "Real-time warehouse management for computer refurbishment - Track pallets and lots with live synchronization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} ${metalMania.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
