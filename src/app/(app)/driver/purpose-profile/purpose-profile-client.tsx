'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Briefcase, HeartHandshake, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { generateCareerIdeasAction, synthesizePurposeProfileAction, saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FocusArea = 'career' | 'contribution' | 'calling';

const focusAreas = [
    { id: 'career' as FocusArea, icon: <Briefcase className="size-8" />, title: "Career", description: "Generate bespoke career ideas." },
    { id: 'contribution' as FocusArea, icon: <HeartHandshake className="size-8" />, title: "Contribution", description: "Understand your unique gifts." },
    { id: 'calling' as FocusArea, icon: <Star className="size-8" />, title: "Calling", description: "Explore your highest spiritual path." },
];

export function PurposeProfileClient() {
  const [isGenerating, setIsGenerating] = useState<FocusArea | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<FocusArea, string | string[]>>({
    career: [],
    contribution: '',
    calling: '',
  });
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

  const handleGenerate = async (area: FocusArea) => {
    if (!userProfile) {
        toast({ title: 'Please complete your profile first.', variant: 'destructive'});
        return;
    }
    
    setIsGenerating(area);

    try {
        if (area === 'career') {
            const result = await generateCareerIdeasAction({ userProfile });
            if (result.success && result.data) {
                setGeneratedContent(prev => ({ ...prev, career: result.data!.ideas }));
                toast({ title: 'Career Ideas Generated!' });
            } else {
                toast({ title: 'Error generating career ideas.', description: result.error, variant: 'destructive'});
            }
        } else {
            const { enneagramType, wing, subtype, instinctualStacking, trifix } = userProfile;
            const result = await synthesizePurposeProfileAction({
                focusArea: area,
                enneagramType,
                wing,
                subtype,
                instinctualStacking,
                trifix,
            });

            if (result.success && result.data) {
                const newContent = { [area]: result.data.purposeProfile };
                setGeneratedContent(prev => ({ ...prev, ...newContent }));
                await saveUserProfile({ uid: user!.uid, profileData: { purposeProfile: result.data.purposeProfile, focusArea: area } });
                toast({ title: `${area.charAt(0).toUpperCase() + area.slice(1)} Profile Generated & Saved!` });
            } else {
                toast({ title: `Error generating ${area} profile.`, description: result.error, variant: 'destructive'});
            }
        }
    } catch (error) {
        console.error(`Error during ${area} generation:`, error);
        toast({ title: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsGenerating(null);
    }
  };

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
      <div className="space-y-6 mb-8">
        {focusAreas.map(area => (
            <Card key={area.id}>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {area.icon}
                        <div>
                            <CardTitle className="font-bold">{area.title}</CardTitle>
                            <CardDescription>{area.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatePresence>
                    {isGenerating === area.id && (
                         <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="animate-spin" /> Generating...
                         </motion.div>
                    )}
                    </AnimatePresence>

                    {area.id === 'career' && Array.isArray(generatedContent.career) && generatedContent.career.length > 0 && (
                        <ul className="list-disc pl-5 space-y-2">
                            {generatedContent.career.map((idea, index) => <li key={index}>{idea}</li>)}
                        </ul>
                    )}
                     {area.id !== 'career' && typeof generatedContent[area.id] === 'string' && generatedContent[area.id] && (
                        <p className="whitespace-pre-wrap font-body">{generatedContent[area.id]}</p>
                    )}
                    
                    <Button onClick={() => handleGenerate(area.id)} disabled={!!isGenerating} className="mt-4">
                        Generate {area.title}
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
      
       <div className="flex justify-between items-center pt-6">
            <Button variant="outline" asChild>
                <Link href="/driver/experimentation"><ArrowLeft /> Previous Step</Link>
            </Button>
            <Button onClick={handleCompleteDriver} disabled={isSaving} className="bg-primary-gradient text-primary-foreground font-bold">
                {isSaving && <Loader2 className="animate-spin mr-2" />}
                Complete The Driver & Proceed <ArrowRight className="ml-2"/>
            </Button>
        </div>
    </>
  );
}
