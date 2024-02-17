import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Odd One Out",
  description: "This is an 12+ rated game",
  openGraph: {
    title: 'Odd One Out',
    description: 'This is an 12+ rated game',
    images : 'https://odd-one-out-game.vercel.app/meta.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
