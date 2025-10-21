
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sparkles, Car, Loader2, BookOpen } from 'lucide-react';
import { generateReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import type { LifePurposeReport } from '@/models/life-purpose-report';

export function ReportClient() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useMemo(() => getFirestore(), []);
    
    const [isLoading, setIsLoading] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user?.uid || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user?.uid, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const lifePurposeReportRef = useMemoFirebase(() => {
        if (!userProfile?.lifePurposeReportId || !firestore) return null;
        return doc(firestore, 'reports', userProfile.lifePurposeReportId);
    }, [userProfile?.lifePurposeReportId, firestore]);
    const { data: lifePurposeReport, isLoading: isReportLoading } = useDoc<LifePurposeReport>(lifePurposeReportRef);
    
    const upa = useMemo(() => {
        if (!userProfile) return null;
        const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
        if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) {
            return null;
        }
        const wingCode = wing.replace(enneagramType, '');
        const subtypeLabel = subtype.toUpperCase();
        const stackingCode = instinctualStacking.toUpperCase();
        
        return `Enneagram ${enneagramType}${wingCode} ${subtypeLabel} ${stackingCode} ${trifix}`;
    }, [userProfile]);

    const handleGenerateReport = async () => {
        if (!user || !userProfile) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in and have a complete driver profile.",
            });
            return;
        }

        const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
        if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) {
             toast({
                variant: "destructive",
                title: "Incomplete Profile",
                description: "Please complete your driver profile before generating a report.",
            });
            return;
        }

        setIsLoading(true);

        const input = {
            uid: user.uid,
            enneagramType,
            wing,
            subtype,
            instinctualStacking,
            trifix,
        };

        const result = await generateReportAction(input);
        setIsLoading(false);

        if (result.success && result.data) {
            toast({
                title: "Report Generated!",
                description: "Your Life Purpose Report is ready below."
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error Generating Report",
                description: result.error || "Something went wrong.",
            });
        }
    };


    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Car className="size-10 text-primary" />
                <div>
                    <p className="text-sm font-bold text-primary">01 THE DRIVER</p>
                    <h1 className="text-4xl font-bold font-headline">Discover what truly motivates you.</h1>
                </div>
            </div>
            
            <Card className="bg-card/80 border-border/50 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline">Your Life Purpose Report</CardTitle>
                    <CardDescription>Using your UPA, we'll create your personalized compass for aligned decision-making.</CardDescription>
                </CardHeader>
                <CardContent>
                    {(isProfileLoading || isReportLoading) && !upa && (
                         <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin size-8" />
                        </div>
                    )}

                    {upa && (
                        <div className="bg-[#d2f0dc] p-6 rounded-lg text-center my-4">
                            <p className="text-sm font-bold text-foreground/80">Your UPA:</p>
                            <p className="text-lg font-bold text-foreground">{upa}</p>
                        </div>
                    )}

                    {!lifePurposeReport && !isReportLoading && (
                        <>
                            <p className="text-center text-muted-foreground mb-6">This one-time report will unveil your unique essence, core energies, and how you're wired to thrive.</p>
                            <div className="text-center">
                                <Button onClick={handleGenerateReport} disabled={isLoading || !upa} className="bg-primary-gradient text-primary-foreground font-bold shadow-lg" size="lg">
                                    {isLoading ? (
                                        <><Loader2 className="mr-2 size-4 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles className="mr-2 size-4" /> Generate My Life Purpose Report</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}

                     {lifePurposeReport && (
                        <div className="mt-8">
                            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-lg font-bold">Read Your Report</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{lifePurposeReport.report}</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                             <div className="text-center mt-6">
                                <p className="text-muted-foreground">You can also find this report on your Insights page.</p>
                                <Button variant="outline" asChild className="mt-2">
                                    <Link href="/insights"><BookOpen className="mr-2"/> Go to Insights</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" asChild>
                    <Link href="/driver"><ArrowLeft className="mr-2" /> Previous</Link>
                </Button>
                <Button asChild className="bg-primary-gradient text-primary-foreground font-bold">
                    <Link href="/driver/core-values">Next <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </div>
    );
}
