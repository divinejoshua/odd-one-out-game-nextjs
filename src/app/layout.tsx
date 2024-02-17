import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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

      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Q5PCGTM9G6"
        strategy="afterInteractive"
        async
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-Q5PCGTM9G6');
        `}
      </Script>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
