
import { IdealWorkEnvironmentClient } from './ideal-work-environment-client';
import { Car } from 'lucide-react';

export default function IdealWorkEnvironmentPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <Car className="size-10 text-primary" />
        <div>
           <h1 className="text-4xl font-bold font-headline">01 The Driver</h1>
           <p className="text-lg text-foreground/80 mt-1">Discover what truly motivates you.</p>
        </div>
      </div>
      
      <IdealWorkEnvironmentClient />
    </div>
  );
}
