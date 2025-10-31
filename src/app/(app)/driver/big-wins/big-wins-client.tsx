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
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';
import Link from 'next/link';

const formSchema = z.object({
  educationTrainingCertifications: z.string().optional(),
  keyAccomplishments: z.string().optional(),
  accoladesAwardsRecognition: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BigWinsClient() {
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
        educationTrainingCertifications: '',
        keyAccomplishments: '',
        accoladesAwardsRecognition: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        educationTrainingCertifications: userProfile.educationTrainingCertifications || '',
        keyAccomplishments: userProfile.keyAccomplishments || '',
        accoladesAwardsRecognition: userProfile.accoladesAwardsRecognition || '',
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
      toast({ title: 'Success', description: 'Your big wins have been saved.' });
      router.push('/driver/skills');
    } catch (error) {
      console.error("Error saving big wins: ", error);
      toast({ title: 'Error', description: 'Could not save your big wins.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin size-8" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-[#FAFFEE] border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Big Wins</CardTitle>
                    <CardDescription>Add some more color to your professional story.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="educationTrainingCertifications" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Education, Training, and Certifications</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="keyAccomplishments" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Key Accomplishments & Notable Projects</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="accoladesAwardsRecognition" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold">Accolades, Awards, and Recognition</FormLabel>
                             <FormControl>
                                <Textarea placeholder="e.g., Employee of the Year 2022, Dean's List, community service award, published article..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/roles"><ArrowLeft /> Previous Step</Link>
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
