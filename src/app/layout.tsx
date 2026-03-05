import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export const metadata: Metadata = {
  title: "LearnBridge",
  description: "App-first learning companion for CBSE Class 5 algebra",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-8">
              <nav className="flex items-center gap-6 text-sm font-medium">
                <a href="/learn" className="text-slate-800 hover:text-blue-600">
                  Learn
                </a>
                <a
                  href="/dashboard"
                  className="text-slate-500 hover:text-blue-600"
                >
                  Progress
                </a>
              </nav>
              <LogoutButton />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
