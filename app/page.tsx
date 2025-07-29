import { Hero } from "@/components/hero";
import BubbleBackground from "@/components/ui/BubbleBackground";
import ToolSection from "@/components/ui/tool-section";
import { UserPlus, CalendarCheck, Info, Repeat } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900">
      {/* Floating background */}
      <BubbleBackground />

      {/* Scroll‐snap container */}
      <div className="snap-y snap-mandatory overflow-y-scroll h-screen scrollbar-hide">
        {/* 1️⃣ Hero stays as first full‑screen */}
        <div className="snap-start h-screen flex items-center justify-center p-5 pt-32">
          <Hero />
        </div>

        {/* 2️⃣ Tool sections, one per screen */}
        <ToolSection
          title="Medication Schedule"
          description="Set up personalized dosing times and get reminders for every family member."
          details="With our schedule tool you can:  
• Add multiple times per day, customized per medication.  
• Set start and end dates to automate recurring reminders.  
• Group medications by person, so you can track kids’ or elders’ regimens separately.  
• Edit or delete at any time—changes sync instantly across devices."

        >
          <CalendarCheck size={48} className="text-blue-600 dark:text-blue-400" />
        </ToolSection>

        <ToolSection
          title="Family Planner"
          description="Manage meds for children, elders, and yourself from a single dashboard."
          details="This tool lets you:  
• Create individual profiles for each family member.  
• Assign relationships (e.g. ‘Mom’, ‘Grandpa’, ‘Toddler’).  
• View and switch between profiles to see that person’s schedule.  
• Remove a profile (and all its meds) when care is no longer needed."
        >
          <UserPlus size={48} className="text-blue-600 dark:text-blue-400" />
        </ToolSection>

        <ToolSection
          title="Medication Info"
          description="Lookup detailed drug composition, uses, and side effects in real-time."
          details="Powered by a 11,000+ medicine dataset plus AI fallback:  
• Get salt composition, approved uses, and side effects.  
• See manufacturer and user review stats (Excellent, Average, Poor).  
• Handles typos and missing dosage via fuzzy search.  
• Falls back to Gemini AI for obscure or new medicines."
        >
          <Info size={48} className="text-blue-600 dark:text-blue-400" />
        </ToolSection>

        <ToolSection
          title="Alternatives"
          description="Discover safer or more affordable medication alternatives instantly."
          details="Your go‑to for:  
• Finding generic or cheaper equivalents.  
• Checking safety by comparing side‑effect profiles.  
• Excluding original drug so you see only true alternatives.  
• Ranking by user review scores to pick the best substitute."
        >
          <Repeat size={48} className="text-blue-600 dark:text-blue-400" />
        </ToolSection>

        {/* 3️⃣ Final CTA */}
        <div className="snap-start h-screen flex items-center justify-center">
          <div className="text-center space-y-6 px-6">
            <h2 className="text-4xl font-bold text-blue-700 dark:text-blue-300">
              Ready to improve your family’s health?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <a
                href="/auth/sign-up"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
              >
                Sign Up
              </a>
              <a
                href="/auth/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer sits outside scroll container */}
      <footer className="w-full text-center text-xs text-gray-500 dark:text-gray-400 p-5">
        © {new Date().getFullYear()} MediCare. All rights reserved.
      </footer>
    </main>
  );
}
