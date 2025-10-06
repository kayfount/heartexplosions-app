import { CoachChat } from './coach-chat';
import { Sparkles, Download, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const resources = [
    { title: "Guide to Finding Your Strengths", description: "A PDF guide to help you identify your core strengths.", href: "#" },
    { title: "Weekly Reflection Journal Template", description: "A Notion template to guide your weekly check-ins.", href: "#" },
    { title: "Time Budgeting System", description: "A practical system for managing your energy and time.", href: "#" },
]

export default function TrailAngelsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Sparkles className="size-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline">Trail Angels: Your Insights Hub</h1>
      </div>
      <p className="text-lg text-foreground/80 mb-8 max-w-4xl">
        You're not alone on this journey. Chat with your AI purpose coach for guidance, or browse our library of helpful resources to support your expedition.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Sparkles className="size-6 text-accent" /> AI Coach</h2>
            <CoachChat />
        </div>
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><BookOpen className="size-6 text-accent" /> Resource Library</h2>
            <div className="space-y-4">
                {resources.map(resource => (
                    <Card key={resource.title} className="bg-background/80 shadow-md border-border/20">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">{resource.title}</CardTitle>
                            <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" asChild>
                                <a href={resource.href} download>
                                    <Download className="mr-2 size-4" /> Download
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
