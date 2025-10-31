
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
import { Input } from '@/components/ui/input';
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
  age: z.coerce.number().optional(),
  desiredRetirementAge: z.coerce.number().optional(),
  location: z.string().optional(),
  preferredWorkLifeBalance: z.string().optional(),
  longTermAspirations: z.string().optional(),
  learningAndDevelopment: z.string().optional(),
  dreamLife: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AspirationsClient() {
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
        age: '' as any,
        desiredRetirementAge: '' as any,
        location: '',
        preferredWorkLifeBalance: '',
        longTermAspirations: '',
        learningAndDevelopment: '',
        dreamLife: '',
    }
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        age: userProfile.age || '',
        desiredRetirementAge: userProfile.desiredRetirementAge || '',
        location: userProfile.location || '',
        preferredWorkLifeBalance: userProfile.preferredWorkLifeBalance || '',
        longTermAspirations: userProfile.longTermAspirations || '',
        learningAndDevelopment: userProfile.learningAndDevelopment || '',
        dreamLife: userProfile.dreamLife || '',
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
      toast({ title: 'Success', description: 'Your aspirations have been saved.' });
      router.push('/driver/ideas');
    } catch (error) {
      console.error("Error saving aspirations: ", error);
      toast({ title: 'Error', description: 'Could not save your aspirations.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div>
      <Progress value={95} className="w-full mb-8 h-2" />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin size-8" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-[#FAFFEE] border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold font-headline">Personal Profile & Future Aspirations</CardTitle>
                    <CardDescription>Let's look at the bigger picture of your life and goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="age" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="desiredRetirementAge" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Desired Retirement Age</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location (City, State, Country)</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <FormField control={form.control} name="preferredWorkLifeBalance" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Describe your preferred work-life balance</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="longTermAspirations" render={({ field }) => (
                        <FormItem>
                            <FormLabel>What are your long-term aspirations and personal goals (outside of career)?</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="learningAndDevelopment" render={({ field }) => (
                        <FormItem>
                            <FormLabel>What skills or areas are you currently focused on for learning and development?</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="dreamLife" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dream Life / "Rich" Life</FormLabel>
                             <FormControl>
                                <Textarea placeholder="Describe your ideal 'dream life' or 'rich life': the time/energy you'd invest and where, environments, activities, leisure, and other values important to you." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/skills"><ArrowLeft /> Previous Step</Link>
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

    