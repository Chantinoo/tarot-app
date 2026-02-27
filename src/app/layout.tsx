import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fate's Whisper — Tarot",
  description: "Draw a card and discover your fortune",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
