import { NextLogo } from "./next-logo";
import { SupabaseLogo } from "./supabase-logo";

export function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center py-12">
      <div className="flex gap-6 justify-center items-center">
        <SupabaseLogo />
        <span className="border-l rotate-45 h-6" />
        <NextLogo />
      </div>
      <h1 className="text-4xl font-bold text-center text-blue-700 dark:text-blue-300 drop-shadow-lg">
        Welcome to MediCare
      </h1>
      <p className="text-lg max-w-2xl text-center text-gray-700 dark:text-gray-200">
        Your AI-powered medication management system. <br />
        Effortlessly track, schedule, and manage medications for yourself and your loved ones. <br />
        <span className="font-semibold">Get started by signing up or logging in above.</span>
      </p>
      <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 w-full p-[1px] my-8 rounded" />
      <div className="max-w-xl text-center text-base text-gray-600 dark:text-gray-300">
        <ol className="list-decimal list-inside space-y-2">
          <li>Sign up and tell us about your health needs.</li>
          <li>Schedule your medications or add for a relative with linked accounts.</li>
          <li>Get reminders, manage schedules, and view everything in your dashboard.</li>
        </ol>
      </div>
    </div>
  );
}
