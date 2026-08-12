import { Inter, Space_Grotesk } from "next/font/google";

export const tenantDisplayFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--tenant-font-display",
});

export const tenantBodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--tenant-font-body",
});
