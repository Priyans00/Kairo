'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition duration-200 ease-in-out text-blue-700 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100 hover:scale-110 ${
        isActive ? 'after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-blue-500 dark:after:bg-blue-300' : ''
      }`}
    >
      {children}
    </Link>
  );
}
