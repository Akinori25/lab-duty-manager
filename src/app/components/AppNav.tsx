'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/members', label: 'Members' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <ul className="nav-links">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive ? 'nav-link active' : 'nav-link'}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <nav className="mobile-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}