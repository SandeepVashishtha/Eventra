import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawerProvider } from "@/context/DrawerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eventra - Discover Events, Hackathons & Projects",
  description: "Eventra is the ultimate platform for tech events, hackathons, and project showcases.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f4fbf7] text-zinc-900 selection:bg-emerald-200 selection:text-emerald-950">
        <DrawerProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </DrawerProvider>
      </body>
    </html>
  );
}
