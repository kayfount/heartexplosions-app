import { RouteForm } from './route-form';
import { Route as RouteIcon } from 'lucide-react';

export default function RoutePage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <RouteIcon className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">The Route: Your Sustainable Roadmap</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8">
        Translate your purpose into action. Based on your available hours, commitments, and desired timeline, our AI will create a realistic Route Plan. This includes milestones, weekly action steps, and pacing suited to your real capacity.
      </p>
      
      <RouteForm />
    </div>
  );
}
