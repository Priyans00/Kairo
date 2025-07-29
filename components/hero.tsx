'use client';

import { UserPlus, CalendarCheck, Bell } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column */}
        <div className="space-y-8 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 dark:text-blue-300 drop-shadow-lg leading-tight">
            Welcome to MediCare
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-200 max-w-lg mx-auto lg:mx-0">
            Your intelligent partner in health management. Our AI-driven platform helps you oversee
            medication schedules for your entire family—children, elders, and everyone in between—so
            you never miss a dose.
          </p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0 mt-8">
            <a
              href="/auth/sign-up"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </a>
            <a
              href="/auth/login"
              className="inline-block px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
            >
              Log In
            </a>
          </div>
        </div>

        {/* Right Column - How It Works */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            {
              Icon: UserPlus,
              title: 'Sign Up',
              description: 'Create a secure account and add profiles for your loved ones.',
            },
            {
              Icon: CalendarCheck,
              title: 'Schedule',
              description: 'Easily add medications and set up tailored schedules.',
            },
            {
              Icon: Bell,
              title: 'Remind',
              description: 'Receive smart alerts so nobody ever misses a dose.',
            },
          ].map(({ Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center p-6 bg-white/20 dark:bg-black/20 rounded-2xl shadow-xl backdrop-blur-md hover:shadow-2xl transition"
            >
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
