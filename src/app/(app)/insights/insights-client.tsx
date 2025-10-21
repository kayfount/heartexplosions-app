
'use client';

import { useMemo } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useUser, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Sparkles, Car, MapPin, Route as RouteIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CoachChat } from './coach-chat';

export function InsightsClient() {
  const { user, isUserLoading } = useUser();
  const firestore = getFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;

  const purposeArchetype = useMemo(() => {
    if (!userProfile) return null;
    const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
    if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) return null;
    
    const wingCode = wing.replace(enneagramType, '');
    const subtypeCode = subtype.toUpperCase();
    const stackingCode = instinctualStacking.toUpperCase();

    return `Enneagram ${enneagramType}${wingCode} ${subtypeCode} ${stackingCode} ${trifix}`;
  }, [userProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>No insights found. Start your journey at the Basecamp to begin!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
        {/* 01 The Driver */}
        <section>
            <div className="flex items-center gap-4 mb-4">
                <Car className="size-8 text-primary" />
                <h2 className="text-3xl font-bold font-headline">01 The Driver</h2>
            </div>
            <div className="space-y-6">
                <InsightCard
                    title="Your Unique Purpose Archetype"
                    description="The high-resolution snapshot of how you're wired to contribute."
                    content={purposeArchetype}
                />
                <InsightCard
                    title="Your Core Values"
                    description="The guiding principles for your decisions and actions."
                    content={userProfile.coreValues ? userProfile.coreValues.join(', ') : 'Not yet defined.'}
                />
                <InsightCard
                    title="Your Life Purpose Report"
                    description="An AI-generated reading of your unique essence, core energies, and how you're wired to thrive."
                    content={userProfile.lifePurposeReportId || "No report generated yet. Complete 'The Driver' step to create it."}
                    isAccordion
                />
            </div>
        </section>

        <Separator />

        {/* 02 The Destination */}
         <section>
            <div className="flex items-center gap-4 mb-4">
                <MapPin className="size-8 text-primary" />
                <h2 className="text-3xl font-bold font-headline">02 The Destination</h2>
            </div>
             <div className="space-y-6">
                <InsightCard
                    title="Your Chosen Focus Area"
                    description="The primary domain you've chosen to channel your purpose into."
                    content={userProfile.focusArea || 'Not yet selected.'}
                />
                 <InsightCard
                    title="Your Purpose Profile"
                    description="Your aligned path, decision-making prompts, and quick wins."
                    content={"This is where the synthesized Purpose Profile content will appear once the data is saved."}
                    isAccordion
                />
            </div>
        </section>

        <Separator />

        {/* 03 The Route */}
        <section>
            <div className="flex items-center gap-4 mb-4">
                <RouteIcon className="size-8 text-primary" />
                <h2 className="text-3xl font-bold font-headline">03 The Route</h2>
            </div>
            <InsightCard
                title="Your Sustainable Roadmap"
                description="A realistic, AI-generated plan with milestones and weekly action steps."
                content={userProfile.availableHours ? "Your personalized route plan will appear here." : "No route plan created yet."}
                isAccordion
            />
        </section>
        
        <Separator />

        {/* AI Coach */}
         <section>
            <div className="flex items-center gap-4 mb-4">
                <Sparkles className="size-8 text-primary" />
                <h2 className="text-3xl font-bold font-headline">AI Coach</h2>
            </div>
            <p className="text-foreground/80 mb-4">You're not alone on this journey. Chat with your AI purpose coach for guidance, or to reflect on your insights.</p>
            <CoachChat />
        </section>
    </div>
  );
}

interface InsightCardProps {
    title: string;
    description: string;
    content: string | null;
    isAccordion?: boolean;
}

function InsightCard({ title, description, content, isAccordion }: InsightCardProps) {

    const handleDownload = () => {
        // Placeholder for PDF generation logic
        alert('PDF download functionality coming soon!');
    }

    const renderContent = () => {
        if (!content) {
            return <p className="text-muted-foreground italic">No data available.</p>
        }
        if (isAccordion) {
            return (
                 <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Report</AccordionTrigger>
                        <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">
                           {content}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )
        }
        return <p className="text-lg font-semibold text-foreground/90">{content}</p>;
    }

    return (
        <Card className="bg-card/80">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
            <div className="p-6 pt-0 flex justify-end gap-2">
                {isAccordion && (
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2"/> Download PDF
                    </Button>
                )}
            </div>
        </Card>
    )
}
