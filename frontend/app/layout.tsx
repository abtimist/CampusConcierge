import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Missed Opportunity Detector",
  description:
    "Discover internships, hackathons, and jobs. Get personalized Telegram & email alerts and add them to your Google Calendar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
