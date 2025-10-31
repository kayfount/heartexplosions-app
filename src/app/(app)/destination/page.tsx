
import { MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function DestinationPage() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <MapPin className="size-10 text-primary" />
        <div>
           <h1 className="text-4xl font-bold font-headline">02 The Destination</h1>
           <p className="text-lg text-foreground/80 mt-1">Decide where this journey leads.</p>
        </div>
      </div>
      
       <Card className="p-8">
            <h2 className="text-3xl font-bold font-headline mb-4 text-center">What You'll Do</h2>
            <p className="text-lg text-center text-foreground/80 max-w-3xl mx-auto">
                Next, you'll explore where this journey is heading. You'll dig into what kind of work lights you up, what environments help you thrive, and what success actually looks like for you. This isn't about picking the "perfect" career—it's about finding the intersection of who you are and what the world needs.
            </p>

            <div className="bg-secondary/40 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-bold font-headline mb-4">Why This Works</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="size-5 text-primary mt-1 shrink-0" />
                        <div>
                            <h4 className="font-bold">Choice Architecture</h4>
                            <p className="text-sm text-muted-foreground">Structuring how you compare options reduces overwhelm and decision fatigue.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle className="size-5 text-primary mt-1 shrink-0" />
                        <div>
                            <h4 className="font-bold">Paired Comparison Method</h4>
                            <p className="text-sm text-muted-foreground">Deciding between two options at a time increases clarity and confidence.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <CheckCircle className="size-5 text-primary mt-1 shrink-0" />
                        <div>
                            <h4 className="font-bold">Self-Determination Theory</h4>
                            <p className="text-sm text-muted-foreground">Making the choice yourself strengthens commitment and follow-through.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
                <Button asChild className="bg-primary-gradient text-primary-foreground font-bold">
                    <Link href="/destination/start">Let's Get Started!</Link>
                </Button>
                <Button variant="outline" asChild>
                     <Link href="/destination/suggestions">View My Suggestions</Link>
                </Button>
            </div>
       </Card>
    </div>
  );
}
