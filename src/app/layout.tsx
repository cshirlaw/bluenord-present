import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BlueNord Present",
  description: "Interactive presentation microsites",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-zinc-50 text-zinc-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <header className="py-3">
            <h1 className="text-lg font-medium text-zinc-700">BlueNord — Present</h1>
          </header>
          <main className="py-6 md:py-10">{children}</main>
          <footer className="py-10 text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} BlueNord
          </footer>
        </div>
      </body>
    </html>
  );
}