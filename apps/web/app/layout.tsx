import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
      <body className="antialiased font-sans">
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
                  Home
                </Link>
                <Link
                  href="/get-started"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/packages"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Packages
                </Link>
                <Link
                  href="/routing"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Routing
                </Link>
                <Link
                  href="/p2p"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  P2P
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/free-energy"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Research
                </Link>
                <a
                  href="https://github.com/vespo92/ChicagoForest.net"
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
