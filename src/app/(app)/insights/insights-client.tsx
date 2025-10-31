'use client';

import { useState, useMemo } from 'react';
import { useDoc, useMemoFirebase } from '@/firebase';
import { useUser } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import type { LifePurposeReport } from '@/models/life-purpose-report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Sparkles, Car, MapPin, Route as RouteIcon, HeartHandshake, Briefcase, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CoachChat } from './coach-chat';
import { generateReportAction, generateCareerIdeasAction, synthesizePurposeProfileAction, createRoutePlanAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type GeneratingState = 'lifePurposeReport' | 'career' | 'contribution' | 'calling' | 'routePlan' | null;

export function InsightsClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const { toast } = useToast();
  const router = useRouter();

  const [generating, setGenerating] = useState<GeneratingState>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading, mutate: mutateUserProfile } = useDoc<UserProfile>(userProfileRef);
  
  const lifePurposeReportRef = useMemoFirebase(() => {
    if (!userProfile?.lifePurposeReportId || !firestore) return null;
    return doc(firestore, 'reports', userProfile.lifePurposeReportId);
  }, [userProfile?.lifePurposeReportId, firestore]);

  const { data: lifePurposeReport, isLoading: isReportLoading, mutate: mutateReport } = useDoc<LifePurposeReport>(lifePurposeReportRef);

  const handleGenerate = async (area: GeneratingState) => {
    if (!user || !userProfile || !area) return;

    setGenerating(area);

    try {
        let result: { success: boolean; error?: string; };

        if (area === 'lifePurposeReport') {
            const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
             if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) {
                toast({ title: "Profile Incomplete", description: "Please complete your Enneagram details in 'The Driver' section first.", variant: 'destructive'});
                router.push('/driver');
                return;
            }
            result = await generateReportAction({ uid: user.uid, enneagramType, wing, subtype, instinctualStacking, trifix });
            if (result.success) mutateReport();

        } else if (area === 'career') {
            result = await generateCareerIdeasAction({ userProfile, uid: user.uid });
        } else if (area === 'contribution' || area === 'calling') {
            const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
             if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) {
                toast({ title: "Profile Incomplete", description: "Please complete your Enneagram details first.", variant: 'destructive'});
                return;
            }
            result = await synthesizePurposeProfileAction({ focusArea: area, uid: user.uid, enneagramType, wing, subtype, instinctualStacking, trifix });
        } else if (area === 'routePlan') {
             const { availableHours, commitments, timeline } = userProfile;
             if (!availableHours || !commitments || !timeline) {
                toast({ title: "Profile Incomplete", description: "Please complete your route inputs in 'The Route' section first.", variant: 'destructive'});
                router.push('/route');
                return;
            }
            const {data: planData, ...planResult} = await createRoutePlanAction({ availableHours, commitments, timeline });
            result = planResult;
            if (result.success && planData) {
                await saveUserProfile({ uid: user.uid, profileData: { routePlan: planData.routePlan } });
            }
        } else {
             result = { success: false, error: 'Unknown generation area.' };
        }

        if (result.success) {
            toast({ title: 'Success!', description: `${area.charAt(0).toUpperCase() + area.slice(1)} has been generated.`});
            mutateUserProfile(); // Re-fetch user profile to get new data
        } else {
            toast({ title: 'Error', description: result.error || `Could not generate ${area}.`, variant: 'destructive' });
        }
    } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setGenerating(null);
    }
  }


  const isLoading = isUserLoading || isProfileLoading || isReportLoading;

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
                    icon={<Briefcase />}
                    title="Generated Career Ideas"
                    description="Bespoke career ideas aligned with your unique profile."
                    content={userProfile.careerIdeas && userProfile.careerIdeas.length > 0 ? userProfile.careerIdeas.join('\n') : null}
                    isAccordion
                    onGenerate={() => handleGenerate('career')}
                    isGenerating={generating === 'career'}
                />
                <InsightCard
                    icon={<HeartHandshake />}
                    title="Your Contribution Profile"
                    description="An exploration of your unique gifts and offerings for the world."
                    content={userProfile.contributionProfile || null}
                    isAccordion
                    onGenerate={() => handleGenerate('contribution')}
                    isGenerating={generating === 'contribution'}
                />
                <InsightCard
                    icon={<Star />}
                    title="Your Calling Profile"
                    description="An insight into the highest spiritual calling of your unique purpose archetype."
                    content={userProfile.callingProfile || null}
                    isAccordion
                    onGenerate={() => handleGenerate('calling')}
                    isGenerating={generating === 'calling'}
                />
                <InsightCard
                    icon={<FileText />}
                    title="Your Life Purpose Report"
                    description="An AI-generated reading of your unique essence, core energies, and how you're wired to thrive."
                    content={lifePurposeReport?.report || null}
                    isAccordion
                    onGenerate={() => handleGenerate('lifePurposeReport')}
                    isGenerating={generating === 'lifePurposeReport'}
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
                    content={userProfile.purposeProfile || "No purpose profile generated yet. Complete 'The Destination' step to create it."}
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
                content={userProfile.routePlan || null}
                isAccordion
                onGenerate={() => handleGenerate('routePlan')}
                isGenerating={generating === 'routePlan'}
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
    icon?: React.ReactNode;
    title: string;
    description: string;
    content: string | null;
    isAccordion?: boolean;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

function InsightCard({ icon, title, description, content, isAccordion, onGenerate, isGenerating }: InsightCardProps) {

    const handleDownload = () => {
        // Placeholder for PDF generation logic
        alert('PDF download functionality coming soon!');
    }

    const renderContent = () => {
        if (!content && !onGenerate) {
            return <p className="text-muted-foreground italic">No data available.</p>;
        }

        if (!content && onGenerate) {
            return (
                <Button onClick={onGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    Generate
                </Button>
            );
        }

        if (content && isAccordion) {
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
                <div className="flex items-center gap-2">
                    {icon}
                    <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
            {isAccordion && content && (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2"/> Download PDF
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
