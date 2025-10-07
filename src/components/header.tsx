
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Tent,
  LifeBuoy,
  MapPin,
  Route,
  Sparkles,
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';

const navItems = [
  { href: '/', icon: <Tent />, label: 'Basecamp' },
  { href: '/driver', icon: <LifeBuoy />, label: 'The Driver' },
  { href: '/destination', icon: <MapPin />, label: 'The Destination' },
  { href: '/route', icon: <Route />, label: 'The Route' },
  { href: '/trail-angels', icon: <Sparkles />, label: 'Trail Angels' },
];

export function Header() {
  const pathname = usePathname();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) {
      initiateSignOut(auth);
    }
  };

  return (
    <header className="bg-[#FAFFEE] sticky top-0 z-50 border-b border-header-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>
          <nav className="hidden md:flex md:items-center md:gap-2 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-bold transition-colors px-4 py-2 rounded-lg text-[#072F29]',
                  pathname === item.href
                    ? 'bg-secondary'
                    : 'hover:bg-secondary/50'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
             <Button variant="ghost" onClick={handleLogout} className="text-[#072F29] hoverbg-secondary/50">
                <LogOut className="mr-2 size-4" />
                Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
