
import { DestinationClient } from './destination-client';
import { MapPin } from 'lucide-react';

export default function DestinationPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-col items-center text-center gap-4 mb-6">
        <MapPin className="size-10 text-primary" />
        <div>
           <h1 className="text-4xl font-bold font-headline">02 The Destination</h1>
           <p className="text-lg text-foreground/80 mt-1">Decide where this journey leads.</p>
        </div>
      </div>
      
      <DestinationClient />
    </div>
  );
}
