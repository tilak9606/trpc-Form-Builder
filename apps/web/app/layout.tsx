import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "FormForge - Build beautiful forms",
  description: "Create, share, and analyze forms with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <GlobalProviders>{children}</GlobalProviders>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
