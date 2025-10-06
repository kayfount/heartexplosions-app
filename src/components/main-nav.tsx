'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Route,
  Sparkles,
  LifeBuoy,
  MapPin,
  Tent,
} from 'lucide-react';

import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/basecamp', icon: <Tent />, label: 'Basecamp' },
  { href: '/driver', icon: <LifeBuoy />, label: 'The Driver' },
  { href: '/destination', icon: <MapPin />, label: 'The Destination' },
  { href: '/route', icon: <Route />, label: 'The Route' },
  { href: '/trail-angels', icon: <Sparkles />, label: 'Trail Angels' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <SidebarSeparator />
        <UserNav />
      </SidebarFooter>
    </>
  );
}
