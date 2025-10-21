
import { DriverForm } from './driver-form';
import { Car } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DriverPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Car className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Determine Your Unique Purpose Archetype</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        Your UPA is a high-resolution snapshot of how you're wired to contribute to the world, built using five deep dimensions of the Enneagram.
      </p>
      
      <DriverForm />

    </div>
  );
}
