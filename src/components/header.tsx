'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/basecamp', icon: '🏕️', label: 'Basecamp' },
  { href: '/driver', icon: '⚙️', label: 'The Driver' },
  { href: '/destination', icon: '📍', label: 'The Destination' },
  { href: '/route', icon: '🗺️', label: 'The Route' },
  { href: '/trail-angels', icon: '📖', label: 'Insights' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <nav className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
             <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2 size-4" />
                Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
