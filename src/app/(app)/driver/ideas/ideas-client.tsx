
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Save, ArrowLeft, PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile, generateCareerIdeasAction } from '@/app/actions';
import Link from 'next/link';

const formSchema = z.object({
    careerIdeas: z.array(z.object({ value: z.string() })),
});

type FormValues = z.infer<typeof formSchema>;

export function IdeasClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
      careerIdeas: [{ value: '' }],
    },
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "careerIdeas"
  });

  useEffect(() => {
    if (userProfile?.careerIdeas && userProfile.careerIdeas.length > 0) {
      replace(userProfile.careerIdeas.map(idea => ({ value: idea })));
    } else {
        // Ensure there is at least one input field if there are no saved ideas.
        if (fields.length === 0) {
            append({ value: '' });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const handleGenerateIdeas = async () => {
    if (!userProfile) {
        toast({ title: 'Please complete your profile first.', variant: 'destructive' });
        return;
    }

    setIsGenerating(true);

    try {
        const result = await generateCareerIdeasAction({ userProfile });
        if (result.success && result.data) {
            const newIdeas = result.data.ideas.map(idea => ({ value: idea }));
            // Filter out empty ideas before replacing
            const currentIdeas = form.getValues('careerIdeas').filter(idea => idea.value.trim() !== '');
            const combinedIdeas = [...currentIdeas, ...newIdeas];
            const uniqueIdeas = Array.from(new Set(combinedIdeas.map(i => i.value))).map(value => ({ value }));

            replace(uniqueIdeas);
            toast({ title: 'Ideas Generated!', description: 'We\'ve added some new ideas to your list.' });
        } else {
            toast({ title: 'Error', description: result.error || 'Could not generate ideas.', variant: 'destructive' });
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    
    const profileData = {
        careerIdeas: data.careerIdeas.map(idea => idea.value).filter(Boolean), // Filter out empty strings
    };

    try {
      await saveUserProfile({ uid: user.uid, profileData });
      toast({ title: 'Success', description: 'Your ideas have been saved.' });
      router.push('/driver/goals-visions');
    } catch (error) {
      console.error("Error saving ideas: ", error);
      toast({ title: 'Error', description: 'Could not save your ideas.', variant: 'destructive' });
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
                    <CardTitle className="text-2xl font-bold font-headline">Career, Callings, &amp; Contribution Ideas</CardTitle>
                    <CardDescription>List all your ideas, sparks, and inspirations for potential paths. Or, let us help you brainstorm!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {fields.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    <FormField
                                        control={form.control}
                                        name={`careerIdeas.${index}.value`}
                                        render={({ field }) => (
                                        <FormItem className="flex-grow">
                                            <FormControl>
                                            <Input placeholder={`Idea ${index + 1}`} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="flex items-center gap-4 pt-4">
                             <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ value: "" })}
                            >
                                <PlusCircle className="mr-2" />
                                Add Another Idea
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleGenerateIdeas} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2"/>}
                                Generate Ideas For Me
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/driver/aspirations"><ArrowLeft className="mr-2 h-4 w-4" /> Previous Step</Link>
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
