import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CryptoProvider } from "@/lib/CryptoContext";

export const metadata: Metadata = {
  title: "CryptoPredict AI — Cryptocurrency Price Prediction & Analysis",
  description: "AI powered cryptocurrency market analysis, deep learning price forecasting, confidence evaluation, and decision support platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <CryptoProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </CryptoProvider>
      </body>
    </html>
  );
}
