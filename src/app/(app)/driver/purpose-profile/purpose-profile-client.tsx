
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Briefcase, HeartHandshake, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { synthesizePurposeProfileAction, saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SynthesizePurposeProfileOutput } from '@/ai/flows/synthesize-purpose-profile';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FocusArea = 'career' | 'contribution' | 'calling';

const focusAreas = [
    { id: 'career' as FocusArea, icon: <Briefcase className="size-8" />, title: "Career", description: "Focus on your professional path and work life." },
    { id: 'contribution' as FocusArea, icon: <HeartHandshake className="size-8" />, title: "Contribution", description: "Focus on how you give back to the world." },
    { id: 'calling' as FocusArea, icon: <Star className="size-8" />, title: "Calling", description: "Focus on your deepest life's purpose and mission." },
];

export function PurposeProfileClient() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedArea, setSelectedArea] = useState<FocusArea | null>(null);
  const [profile, setProfile] = useState<SynthesizePurposeProfileOutput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile?.focusArea) {
      setSelectedArea(userProfile.focusArea);
      if (userProfile.purposeProfile) {
          try {
            const parsedProfile = JSON.parse(userProfile.purposeProfile);
            setProfile(parsedProfile);
          } catch(e) {
            console.error("Failed to parse purpose profile from DB", e);
            if (user) {
              handleSelectArea(userProfile.focusArea, true);
            }
          }
      } else if (user) {
        handleSelectArea(userProfile.focusArea, true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, user]);

  const handleSelectArea = async (area: FocusArea, isPreload = false) => {
    if(!isPreload) {
      setSelectedArea(area);
    }
    setIsSynthesizing(true);
    setProfile(null);

    // In a real app, the driverReport would be fetched for the logged-in user.
    const dummyDriverReport = "The user is a Type 9, driven by peace and harmony. They avoid conflict and seek to create a calm and stable environment. Their genius lies in mediation, empathy, and seeing multiple perspectives. Growth edge is in asserting their own needs and priorities.";
    
    if (user) {
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

    const result = await synthesizePurposeProfileAction({ focusArea: area, driverReport: dummyDriverReport });
    
    if (result.success && result.data) {
      setProfile(result.data);
       if(!isPreload) {
         toast({
          title: 'Profile Synthesized!',
          description: 'Your Purpose Profile is ready.',
        });
      }
      if (user) {
          await saveUserProfile({ uid: user.uid, profileData: { purposeProfile: JSON.stringify(result.data) }});
      }
    } else if(!isPreload) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Something went wrong.',
      });
    }
    setIsSynthesizing(false);
  }

  const handleCompleteDriver = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        await saveUserProfile({ uid: user.uid, profileData: { driverCompleted: true } });
        toast({
            title: 'Phase 01 Complete!',
            description: 'You have successfully completed The Driver phase.'
        });
        router.push('/destination');
    } catch(e) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your progress.',
        });
    } finally {
        setIsSaving(false);
    }
  }


  if (isUserLoading || isProfileLoading) {
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
                onClick={() => !isSynthesizing && handleSelectArea(area.id)}
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
      {isSynthesizing && (
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
                <div className="flex justify-between items-center pt-6">
                    <Button variant="outline" asChild>
                        <Link href="/driver/experimentation"><ArrowLeft /> Previous Step</Link>
                    </Button>
                    <Button onClick={handleCompleteDriver} disabled={isSaving} className="bg-primary-gradient text-primary-foreground font-bold">
                        {isSaving && <Loader2 className="animate-spin mr-2" />}
                        Complete The Driver & Proceed <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>
       {!profile && !isSynthesizing && (
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/experimentation"><ArrowLeft /> Previous Step</Link>
              </Button>
            </div>
      )}
    </>
  );
}
