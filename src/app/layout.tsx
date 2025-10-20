import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Heart Explosions',
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
      <body className="font-sans antialiased bg-gradient-to-br from-[#faffee] to-[#D3F0DB]">
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
