export function Hero() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center text-center max-w-3xl mx-auto">
      <h1 className="text-5xl font-bold text-blue-700 dark:text-blue-300 drop-shadow-lg">
        Welcome to MediCare
      </h1>
      <p className="text-xl text-gray-700 dark:text-gray-200">
        Your intelligent partner in health management. Our AI-driven platform helps you effortlessly
        oversee medication schedules for you and your family, ensuring peace of mind and timely
        care.
      </p>
      <div className="w-full p-[1px] my-6 bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800" />
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          How It Works
        </h2>
        <ol className="text-lg text-gray-600 dark:text-gray-300 space-y-3 list-decimal list-inside">
          <li>
            <span className="font-semibold">Sign Up:</span> Create your secure account and tell us
            about your health needs.
          </li>
          <li>
            <span className="font-semibold">Schedule Medications:</span> Easily add medications for
            yourself or a loved one with our intuitive scheduling system.
          </li>
          <li>
            <span className="font-semibold">Stay on Track:</span> Receive smart reminders and manage
            everything from your personalized dashboard.
          </li>
        </ol>
      </div>
      <p className="mt-6 text-lg font-semibold text-blue-600 dark:text-blue-400">
        Ready to take control of your health? Sign up or log in to get started!
      </p>
    </div>
  );
}
