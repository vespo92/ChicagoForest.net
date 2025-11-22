import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chicago Plasma Forest Network",
  description: "Revolutionary peer-to-peer network for wireless energy distribution across the entire Chicago metropolitan area including suburbs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                Chicago Forest 🌲⚡
              </Link>
              <div className="flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Network
                </Link>
                <Link 
                  href="/free-energy" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Research
                </Link>
                <Link
                  href="/whitepaper"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Whitepaper
                </Link>
                <Link
                  href="/tools"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Tools
                </Link>
                <a
                  href="https://github.com/chicago-forest" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </nav>
        </header>
        
        {/* Main Content with padding for fixed header */}
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
