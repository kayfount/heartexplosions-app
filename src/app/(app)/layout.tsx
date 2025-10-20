
'use client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is not loading and is null, redirect to the login page.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  // While the user state is loading, you can show a loading indicator.
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is authenticated, render the children.
  if (user) {
    return <>{children}</>;
  }

  // If the user is not authenticated and not loading, they will be redirected.
  // You can return null or a minimal layout here.
  return null;
}
