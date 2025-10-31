import { IdeasClient } from './ideas-client';
import { Car } from 'lucide-react';

export default function IdeasPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-2">
        <Car className="size-10 text-primary" />
        <div>
          <p className="text-sm font-bold text-primary">01 THE DRIVER</p>
          <h1 className="text-4xl font-bold font-headline">Discover what truly motivates you.</h1>
        </div>
      </div>
      
      <IdeasClient />
    </div>
  );
}
