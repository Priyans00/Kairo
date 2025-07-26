import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MediCare - Medication Management",
  description: "AI-powered medication management system",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900 min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="w-full fixed top-0 left-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-b-foreground/10 h-16 flex items-center justify-center shadow-sm">
            <div className="w-full max-w-6xl flex justify-between items-center px-6">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-2xl font-bold text-blue-700 dark:text-blue-200 tracking-tight">MediCare</Link>
                <Link href="/protected" className="text-base font-medium text-blue-700 dark:text-blue-200 hover:underline">Dashboard</Link>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/protected/medicine" className="hover:text-foreground/80">
                  Medicine Info
                </Link>
                <ThemeSwitcher />
                <AuthButton />
              </div>
            </div>
          </nav>
          <main className="pt-20 min-h-screen flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
