import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zazasquatch - Brownies y Galletas Infusionados con THC-P y THC-O",
  description: "Brownies y galletas artesanales infusionados con THC-P y THC-O. Productos potentes y de calidad premium para usuarios responsables mayores de 18 años.",
  keywords: ["brownies infusionados", "galletas THC", "THC-P", "THC-O", "productos de cannabis", "brownies potentes", "Zazasquatch"],
  openGraph: {
    title: "Zazasquatch - Brownies y Galletas Infusionados",
    description: "Brownies y galletas con potencia monstruosa. Infusionados con THC-P y THC-O para experiencias intensas.",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
