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
  willingnessToTry: z.string().optional(),
  comfortWithUncertainty: z.string().optional(),
  appetiteForRisk: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExperimentationClient() {
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
      willingnessToTry: '',
      comfortWithUncertainty: '',
      appetiteForRisk: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        willingnessToTry: userProfile.willingnessToTry || '',
        comfortWithUncertainty: userProfile.comfortWithUncertainty || '',
        appetiteForRisk: userProfile.appetiteForRisk || '',
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
        driverCompleted: true,
    };

    try {
      await saveUserProfile({ uid: user.uid, profileData });
      toast({ title: 'Success', description: 'Your information has been saved.' });
      router.push('/destination');
    } catch (error) {
      console.error("Error saving experimentation data: ", error);
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
                    <CardTitle className="text-2xl font-bold font-headline">Experimentation Comfort Zone</CardTitle>
                    <CardDescription>How much change and risk are you ready for?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="willingnessToTry" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Willingness to Try New Industries or Skillsets</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Very open to learning a new skill like coding, hesitant to leave the healthcare industry..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="comfortWithUncertainty" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Comfort With Uncertainty and Change</FormLabel>
                            <FormControl><Textarea placeholder="e.g., I thrive in chaos, I need a very stable and predictable environment..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="appetiteForRisk" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Appetite for Risk in Career/Calling Moves</FormLabel>
                            <FormControl><Textarea placeholder="e.g., Willing to take a big pay cut for a dream job, prefer a slow and steady transition, thinking of starting my own business..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/boundaries"><ArrowLeft /> Previous Step</Link>
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-primary-gradient text-primary-foreground font-bold">
                {isSaving ? <Save className="mr-2 animate-spin" /> : 'Complete The Driver'}
                {!isSaving && <ArrowRight className="ml-2" />}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
