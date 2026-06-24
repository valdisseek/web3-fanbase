import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fanbase — FPL DFS & Betting",
  description:
    "Player-points props, H2H challenges, and rake-based prize pools on real FPL data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
