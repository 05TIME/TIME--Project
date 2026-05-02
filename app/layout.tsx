import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "$TIMEOE - Time AI Godfather",
  description: "An AI system that embodies time as the father of AI. Advanced time manipulation, prediction, causality detection, and counterfactual simulation.",
  keywords: ["temporal reasoning", "causal AI", "counterfactual simulation", "time series", "Grok", "xAI"],
};

export const viewport: Viewport = {
  themeColor: "#1a1b26",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="antialiased min-h-screen">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
