
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';
import Link from 'next/link';

const formSchema = z.object({
  preferredWorkLifeBalance: z.string().optional(),
  collaborationStyle: z.string().optional(),
  structurePreference: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const workLocationOptions = ['Remote', 'Office', 'Hybrid', 'Other'];
const collaborationStyleOptions = ['Collaborative Teams', 'Autonomous/Independent', 'Other'];
const structurePreferenceOptions = ['Structured', 'Flexible', 'Other'];

export function IdealWorkEnvironmentClient() {
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
      preferredWorkLifeBalance: '',
      collaborationStyle: '',
      structurePreference: '',
    },
  });

  const { watch } = form;

  const watchWorkLocation = watch('preferredWorkLifeBalance');
  const watchCollaborationStyle = watch('collaborationStyle');
  const watchStructurePreference = watch('structurePreference');

  useEffect(() => {
    if (userProfile) {
      form.reset({
        preferredWorkLifeBalance: userProfile.preferredWorkLifeBalance || '',
        collaborationStyle: userProfile.collaborationStyle || '',
        structurePreference: userProfile.structurePreference || '',
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
      await saveUserProfile({ uid: user.uid, profileData: data });
      toast({ title: 'Success', description: 'Your ideal work environment has been saved.' });
      router.push('/driver/goals-visions');
    } catch (error) {
      console.error("Error saving ideal work environment: ", error);
      toast({ title: 'Error', description: 'Could not save your preferences.', variant: 'destructive' });
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
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="font-bold">Ideal Work Environment</CardTitle>
                <CardDescription>How do you work best?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="preferredWorkLifeBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Work Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workLocationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="collaborationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Collaboration Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {collaborationStyleOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="structurePreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Structure Preference</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {structurePreferenceOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {watchWorkLocation === 'Other' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <FormField control={form.control} name="preferredWorkLifeBalance" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Other Work Location</FormLabel>
                                    <FormControl><Input placeholder="Specify..." {...field} /></FormControl>
                                </FormItem>
                            )}/>
                        </motion.div>
                    )}
                    {watchCollaborationStyle === 'Other' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={watchWorkLocation !== 'Other' ? 'md:col-start-2' : ''}>
                             <FormField control={form.control} name="collaborationStyleOther" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Other Collaboration Style</FormLabel>
                                    <FormControl><Input placeholder="Specify..." {...field} /></FormControl>
                                </FormItem>
                            )}/>
                        </motion.div>
                    )}
                     {watchStructurePreference === 'Other' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={watchWorkLocation !== 'Other' && watchCollaborationStyle !== 'Other' ? 'md:col-start-3' : ''}>
                             <FormField control={form.control} name="structurePreferenceOther" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Other Structure Preference</FormLabel>
                                    <FormControl><Input placeholder="Specify..." {...field} /></FormControl>
                                </FormItem>
                            )}/>
                        </motion.div>
                    )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/ideas"><ArrowLeft /> Previous Step</Link>
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
