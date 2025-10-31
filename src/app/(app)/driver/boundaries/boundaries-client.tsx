'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Save, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';
import Link from 'next/link';

const formSchema = z.object({
  timeLimits: z.string().optional(),
  financialRunway: z.string().optional(),
  workLifeIntegration: z.string().optional(),
  supportSystem: z.string().optional(),
  fearsAndBlocks: z.string().optional(),
  challengesAndConcerns: z.string().optional(),
  toolsAndSupports: z.string().optional(),
  learningAndDevelopment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BoundariesClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeLimits: '',
      financialRunway: '',
      workLifeIntegration: '',
      supportSystem: '',
      fearsAndBlocks: '',
      challengesAndConcerns: '',
      toolsAndSupports: '',
      learningAndDevelopment: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        timeLimits: userProfile.timeLimits || '',
        financialRunway: userProfile.financialRunway || '',
        workLifeIntegration: userProfile.workLifeIntegration || '',
        supportSystem: userProfile.supportSystem || '',
        fearsAndBlocks: userProfile.fearsAndBlocks || '',
        challengesAndConcerns: userProfile.challengesAndConcerns || '',
        toolsAndSupports: userProfile.toolsAndSupports || '',
        learningAndDevelopment: userProfile.learningAndDevelopment || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    const profileData = {
        ...data,
    };

    try {
      await saveUserProfile({ uid: user.uid, profileData });
      toast({ title: 'Success', description: 'Your information has been saved.' });
      router.push('/driver/experimentation');
    } catch (error) {
      console.error("Error saving boundaries: ", error);
      toast({ title: 'Error', description: 'Could not save your information.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div>
      <Progress value={100} className="w-full mb-8 h-2" />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin size-8" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-[#FAFFEE] border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Boundaries, Constraints, and Challenges</CardTitle>
                    <CardDescription>What are the real-world limits and needs you're working with?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="timeLimits" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Time Limits, Caregiving Responsibilities, Physical Constraints</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Can only work 20 hours/week, need to be home by 3 PM for kids, have a bad back and can't do physical labor..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="financialRunway" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Financial Runway or Income Requirements</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Need to make at least $60k/year, have 6 months of savings, cannot take a pay cut..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="workLifeIntegration" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Work/Life Integration Needs</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Need flexible hours, ability to work remotely, cannot work weekends..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="supportSystem" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Describe your support system (family, friends, mentors, role models)</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="fearsAndBlocks" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">What fears or blocks are you currently dealing with?</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="challengesAndConcerns" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">What specific challenges or concerns do you want to address in your transition into a more aligned role?</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="toolsAndSupports" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">List any tools, supports, mindsets, or ideas that will help you overcome these obstacles as you work toward your goals. (Don't worry, we'll create more!)</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="learningAndDevelopment" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">What skills or areas are you currently focused on for learning and development?</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/goals-visions"><ArrowLeft /> Previous Step</Link>
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-primary-gradient text-primary-foreground font-bold">
                {isSaving ? <Save className="mr-2 animate-spin" /> : 'Next Step'}
                {!isSaving && <ArrowRight className="ml-2" />}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
