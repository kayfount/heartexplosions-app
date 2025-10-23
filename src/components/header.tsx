
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tent,
  Car,
  MapPin,
  Route,
  Sparkles,
} from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/basecamp', label: 'Basecamp', icon: <Tent /> },
  { href: '/driver', label: 'The Driver', icon: <Car /> },
  { href: '/destination', label: 'The Destination', icon: <MapPin /> },
  { href: '/route', label: 'The Route', icon: <Route /> },
  { href: '/insights', label: 'Insights', icon: <Sparkles /> },
];

export function Header() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  
  const showNav = user && !isUserLoading;

  return (
    <header className="bg-[#FAFFEE] sticky top-0 z-50 border-b border-header-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={showNav ? "/basecamp" : "/"}>
              <Logo />
            </Link>
          </div>
          {showNav ? (
            <>
            <nav className="hidden md:flex md:items-center md:gap-2 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-bold transition-colors px-4 py-2 rounded-lg text-[#072F29]',
                      isActive
                        ? 'bg-secondary'
                        : 'hover:bg-secondary/50'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2">
              <UserNav />
            </div>
            </>
          ) : (
             <div className="flex items-center gap-4">
                <Button asChild variant="ghost">
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-primary-gradient text-primary-foreground font-bold">
                    <Link href="/signup">Sign Up</Link>
                </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}

    