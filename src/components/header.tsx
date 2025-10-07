'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Tent,
  Car,
  MapPin,
  Route,
  BookOpen,
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/basecamp', icon: <Tent />, label: 'Basecamp' },
  { href: '/driver', icon: <Car />, label: 'The Driver' },
  { href: '/destination', icon: <MapPin />, label: 'The Destination' },
  { href: '/route', icon: <Route />, label: 'The Route' },
  { href: '/trail-angels', icon: <BookOpen />, label: 'Insights' },
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
          <nav className="hidden md:flex md:items-center md:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-lg',
                  pathname.startsWith(item.href)
                    ? 'bg-secondary text-foreground'
                    : 'text-foreground hover:bg-secondary/50'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
             <Button variant="ghost" className="text-foreground hover:bg-secondary/50">
                <LogOut className="mr-2 size-4" />
                Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
