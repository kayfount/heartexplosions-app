import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tent } from 'lucide-react';

export default function BasecampPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-background">
      <Card className="w-full max-w-2xl mx-auto bg-card text-center">
        <CardHeader>
          <div className="mx-auto bg-secondary p-3 rounded-full">
            <Tent className="size-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline mt-4">Welcome to Basecamp</CardTitle>
          <CardDescription className="text-lg">
            This is your starting point, a place to ground yourself before the expedition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground/80">
            <span className="font-bold">Your Focus:</span> First, we'll clarify your values, strengths, and current capacity. This is the foundation for a meaningful journey.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button asChild size="lg" className="w-full max-w-xs bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-md transition-transform hover:scale-105">
            <Link href="/basecamp/wizard">
              Get Started Here <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
