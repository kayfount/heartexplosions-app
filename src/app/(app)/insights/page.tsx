
import { InsightsClient } from './insights-client';
import { Sparkles } from 'lucide-react';
import { Suspense } from 'react';

export default function InsightsPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Sparkles className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Your Expedition Insights</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        This is your personal dashboard for all the wisdom you've uncovered. Review your reports, track your progress, and connect with your AI coach.
      </p>
      
      <Suspense fallback={<div className="text-center p-8">Loading your insights...</div>}>
        <InsightsClient />
      </Suspense>
    </div>
  );
}
