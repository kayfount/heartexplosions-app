import { DriverForm } from './driver-form';
import { Car } from 'lucide-react';

export default function DriverPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Car className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">The Driver: Reveal Your Purpose</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        Uncover your core motivations and natural genius. By providing your Enneagram details, our AI will generate a personalized Life Purpose Report, outlining your path to growth, your core values, and your unique strengths.
      </p>
      
      <DriverForm />
    </div>
  );
}
