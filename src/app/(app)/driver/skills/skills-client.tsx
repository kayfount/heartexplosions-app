
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
  skills: z.string().optional(),
  passions: z.string().optional(),
  interests: z.string().optional(),
  industrySectors: z.string().optional(),
  energizingWork: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SkillsClient() {
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
      skills: '',
      passions: '',
      interests: '',
      industrySectors: '',
      energizingWork: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        skills: userProfile.skills || '',
        passions: userProfile.passions || '',
        interests: userProfile.interests || '',
        industrySectors: userProfile.industrySectors || '',
        energizingWork: userProfile.energizingWork || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    try {
      await saveUserProfile({ uid: user.uid, profileData: { ...data, driverCompleted: true } });
      toast({ title: 'Success', description: 'Your information has been saved.' });
      router.push('/destination');
    } catch (error) {
      console.error("Error saving skills: ", error);
      toast({ title: 'Error', description: 'Could not save your information.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div>
      <Progress value={100} className="w-full mb-8 h-2" />
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Skills, Passions, Hobbies, and Interests</CardTitle>
          <CardDescription>
            What are you good at, what do you love, and what energizes you?
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin size-8" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passions</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbies & Interests</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industrySectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Industry Sectors That Interest You</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="energizingWork"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What kinds of work, topics, projects, and challenges truly energize you? Describe the specific impact and people or causes you feel called to serve.</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
        </CardContent>
      </Card>
    </div>
  );
}
