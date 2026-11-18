import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawerProvider } from "@/context/DrawerContext";
import SessionExpiryBanner from "@/components/ui/SessionExpiryBanner";

export const metadata = {
  title: "Eventra - Discover Events, Hackathons & Projects",
  description: "Eventra is the ultimate platform for tech events, hackathons, and project showcases.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white antialiased">
        <DrawerProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <SessionExpiryBanner />
        </DrawerProvider>
      </body>
    </html>
  );
}
