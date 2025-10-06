import { BasecampWizard } from './basecamp-wizard';
import { Tent } from 'lucide-react';

export default function BasecampPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Tent className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Basecamp: Set Your Starting Point</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        Every great expedition begins with knowing where you stand. This guided onboarding will help you clarify your current season, values, strengths, and time budget. The result will be a personalized "Starting Point" summary to guide your journey.
      </p>
      
      <BasecampWizard />
    </div>
  );
}
