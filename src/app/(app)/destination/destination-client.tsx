
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Briefcase, HeartHandshake, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { synthesizeProfileAction, saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SynthesizePurposeProfileOutput } from '@/ai/flows/synthesize-purpose-profile';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import { useMemo } from 'react';
import type { LifePurposeReport } from '@/models/life-purpose-report';


type FocusArea = 'career' | 'contribution' | 'calling';

const focusAreas = [
    { id: 'career' as FocusArea, icon: <Briefcase className="size-8" />, title: "Career", description: "Focus on your professional path and work life." },
    { id: 'contribution' as FocusArea, icon: <HeartHandshake className="size-8" />, title: "Contribution", description: "Focus on how you give back to the world." },
    { id: 'calling' as FocusArea, icon: <Star className="size-8" />, title: "Calling", description: "Focus on your deepest life's purpose and mission." },
];

export function DestinationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<FocusArea | null>(null);
  const [profile, setProfile] = useState<SynthesizePurposeProfileOutput | null>(null);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);
  const { data: userProfile, isLoading: isProfileLoading, mutate } = useDoc<UserProfile>(userProfileRef);

  const lifePurposeReportRef = useMemoFirebase(() => {
    if (!userProfile?.lifePurposeReportId || !firestore) return null;
    return doc(firestore, 'reports', userProfile.lifePurposeReportId);
  }, [userProfile?.lifePurposeReportId, firestore]);
  const { data: lifePurposeReport, isLoading: isReportLoading } = useDoc<LifePurposeReport>(lifePurposeReportRef);

  useEffect(() => {
    if (userProfile?.focusArea) {
      setSelectedArea(userProfile.focusArea);
      if (userProfile.purposeProfile) {
        // If profile is already saved, just display it
        setProfile({
            purposeProfile: userProfile.purposeProfile,
            // The other fields are not stored, so we'll leave them blank or provide default text
            alignedPath: userProfile.alignedPath || '',
            edgeOfChoosingPrompts: userProfile.edgeOfChoosingPrompts || '',
            quickWins: userProfile.quickWins || '',
        });
      } else {
        handleSelectArea(userProfile.focusArea, true);
      }
    }
  }, [userProfile, lifePurposeReport]);

  const handleSelectArea = async (area: FocusArea, isInitialLoad = false) => {
    setSelectedArea(area);
    
    if (!isInitialLoad) {
        setIsLoading(true);
        setProfile(null);
    }
    
    if (!lifePurposeReport?.report) {
         if (!isInitialLoad) { // Only show toast on user action
            toast({
                variant: 'destructive',
                title: 'Driver Report Missing',
                description: 'Please complete the Driver stage to generate your Life Purpose Report first.',
            });
            setIsLoading(false);
        }
        return;
    }
    
    if (user && !isInitialLoad) {
        try {
            await saveUserProfile({ uid: user.uid, profileData: { focusArea: area } });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error Saving Choice',
                description: 'Could not save your focus area choice.',
            });
        }
    }

    const result = await synthesizeProfileAction({ focusArea: area, driverReport: lifePurposeReport.report });
    
    if (!isInitialLoad) {
        setIsLoading(false);
    }

    if (result.success && result.data) {
      setProfile(result.data);
       if (user) {
         try {
            await saveUserProfile({ 
                uid: user.uid, 
                profileData: { 
                    purposeProfile: result.data.purposeProfile,
                    alignedPath: result.data.alignedPath,
                    edgeOfChoosingPrompts: result.data.edgeOfChoosingPrompts,
                    quickWins: result.data.quickWins,
                } 
            });
            mutate(); // re-fetch data
         } catch(e) {
             toast({ variant: 'destructive', title: 'Error Saving Profile', description: 'Could not save the generated profile.'});
         }
       }
       if (!isInitialLoad) {
        toast({
            title: 'Profile Synthesized!',
            description: 'Your Purpose Profile is ready.',
        });
       }
    } else {
       if (!isInitialLoad) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Something went wrong.',
        });
       }
    }
  }

  if (isUserLoading || isProfileLoading || isReportLoading) {
      return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin size-8" />
        </div>
      )
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
