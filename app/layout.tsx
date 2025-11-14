import type { Metadata } from "next";
import { Indie_Flower, Comfortaa, Crimson_Text } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const indieFlower = Indie_Flower({
  variable: "--font-title",
  subsets: ["latin"],
  weight: "400",
});

const comfortaa = Comfortaa({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const crimsonText = Crimson_Text({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "My Idea Journal - Capture & Explore Your Creative Thoughts",
  description: "A beautiful, artistic diary for capturing and developing your ideas with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${comfortaa.variable} ${crimsonText.variable} ${indieFlower.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
