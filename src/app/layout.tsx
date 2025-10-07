import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

export const metadata: Metadata = {
  title: 'Heart Compass',
  description: 'Navigate Your Path to Purpose',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
      </head>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
