import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import SocketInitializer from "@/components/meeting/SocketInitializer";

import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Parla",
  description: "Multilingual real-time text and emotion translator",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.className}>
      <body>
        <SocketInitializer />
        {children}
      </body>
    </html>
  );
}
