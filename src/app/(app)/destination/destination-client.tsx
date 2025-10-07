'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Briefcase, HeartHand, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { synthesizeProfileAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SynthesizePurposeProfileOutput } from '@/ai/flows/synthesize-purpose-profile';
import { cn } from '@/lib/utils';

type FocusArea = 'career' | 'contribution' | 'calling';

const focusAreas = [
    { id: 'career' as FocusArea, icon: <Briefcase className="size-8" />, title: "Career", description: "Focus on your professional path and work life." },
    { id: 'contribution' as FocusArea, icon: <HeartHand className="size-8" />, title: "Contribution", description: "Focus on how you give back to the world." },
    { id: 'calling' as FocusArea, icon: <Star className="size-8" />, title: "Calling", description: "Focus on your deepest life's purpose and mission." },
];

export function DestinationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<FocusArea | null>(null);
  const [profile, setProfile] = useState<SynthesizePurposeProfileOutput | null>(null);
  const { toast } = useToast();

  const handleSelectArea = async (area: FocusArea) => {
    setSelectedArea(area);
    setIsLoading(true);
    setProfile(null);

    // In a real app, the driverReport would be fetched for the logged-in user.
    const dummyDriverReport = "The user is a Type 9, driven by peace and harmony. They avoid conflict and seek to create a calm and stable environment. Their genius lies in mediation, empathy, and seeing multiple perspectives. Growth edge is in asserting their own needs and priorities.";
    
    const result = await synthesizeProfileAction({ focusArea: area, driverReport: dummyDriverReport });
    setIsLoading(false);

    if (result.success && result.data) {
      setProfile(result.data);
      toast({
        title: 'Profile Synthesized!',
        description: 'Your Purpose Profile is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Something went wrong.',
      });
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {focusAreas.map(area => (
            <Card 
                key={area.id}
                onClick={() => !isLoading && handleSelectArea(area.id)}
                className={cn(
                    "text-center p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1",
                    selectedArea === area.id ? 'border-primary border-4 shadow-primary/20' : 'hover:border-primary/50'
                )}
            >
                <div className={cn("mx-auto flex items-center justify-center size-16 rounded-full bg-secondary mb-4", selectedArea === area.id && "bg-primary text-primary-foreground")}>
                    {area.icon}
                </div>
                <h3 className="text-xl font-bold font-headline">{area.title}</h3>
                <p className="text-muted-foreground mt-1">{area.description}</p>
            </Card>
        ))}
      </div>

      <AnimatePresence>
      {isLoading && (
        <motion.div
            className="flex justify-center items-center gap-2 text-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Synthesizing your profile...
        </motion.div>
      )}
      {profile && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
          <Card className="mt-8 border-primary/50">
            <CardHeader>
                <CardTitle>Your Purpose Profile</CardTitle>
                <CardDescription>Based on your selection of "{selectedArea}".</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-bold">Purpose Profile</AccordionTrigger>
                        <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{profile.purposeProfile}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-lg font-bold">Aligned Path</AccordionTrigger>
                        <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{profile.alignedPath}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-lg font-bold">Edge of Choosing Prompts</AccordionTrigger>
                        <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{profile.edgeOfChoosingPrompts}</AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger className="text-lg font-bold">Quick Wins</AccordionTrigger>
                        <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{profile.quickWins}</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
