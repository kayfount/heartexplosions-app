import { DestinationClient } from './destination-client';
import { MapPin } from 'lucide-react';

export default function DestinationPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <MapPin className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">The Destination: Decide Your Focus</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        Now that you have your Driver report, it's time to choose your direction. Select one focus area below. Our AI will synthesize your insights into a Purpose Profile, identifying your most aligned path and providing prompts and quick wins to get you started.
      </p>
      
      <DestinationClient />
    </div>
  );
}
