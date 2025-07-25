import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900 p-5">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <Hero />
      </div>
      <footer className="w-full text-center text-xs text-gray-500 dark:text-gray-400 p-5">
        <p>© {new Date().getFullYear()} MediCare. All rights reserved.</p>
      </footer>
    </main>
  );
}
