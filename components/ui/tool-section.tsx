'use client';

import { ReactNode } from 'react';

interface ToolSectionProps {
  title: string;
  description: string;
  details: string;
  children: ReactNode;
}

export default function ToolSection({ title, description, details, children }: ToolSectionProps) {
  return (
    <section className="snap-start h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-4">
        <div className="mx-auto">{children}</div>
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300">{title}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-200">{description}</p>
        <p className="text-gray-600 dark:text-gray-400">{details}</p>
      </div>
    </section>
  );
}
