
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, Save, ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';
import Link from 'next/link';

const formSchema = z.object({
  skills: z.array(z.object({ value: z.string().min(1, 'Skill cannot be empty.') })),
  passions: z.array(z.object({ value: z.string().min(1, 'Passion cannot be empty.') })),
  interests: z.array(z.object({ value: z.string().min(1, 'Hobby or interest cannot be empty.') })),
});

type FormValues = z.infer<typeof formSchema>;


function DynamicFieldArray({ name, label, placeholder, control, register }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <FormItem>
      <FormLabel className="font-bold">{label}</FormLabel>
      <div className="space-y-2">
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
              <Input
                placeholder={placeholder}
                {...register(`${name}.${index}.value`)}
                className="flex-grow"
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
      </div>
      <Button
        type="button"
        variant="link"
        className="text-primary font-bold"
        onClick={() => append({ value: '' })}
      >
        <PlusCircle className="mr-2" />
        Add Another
      </Button>
       <p className="text-sm text-muted-foreground">Added: {fields.length} {label.toLowerCase()}</p>
    </FormItem>
  );
}


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
      skills: [{ value: '' }],
      passions: [{ value: '' }],
      interests: [{ value: '' }],
    },
  });

  useEffect(() => {
    if (userProfile) {
      const resetValues: any = {
      };
  
      resetValues.skills = userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.map(s => ({ value: s })) : [{ value: '' }];
      resetValues.passions = userProfile.passions && userProfile.passions.length > 0 ? userProfile.passions.map(p => ({ value: p })) : [{ value: '' }];
      resetValues.interests = userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests.map(i => ({ value: i })) : [{ value: '' }];
  
      form.reset(resetValues);
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
        skills: data.skills.map(s => s.value).filter(Boolean),
        passions: data.passions.map(p => p.value).filter(Boolean),
        interests: data.interests.map(i => i.value).filter(Boolean),
    };

    try {
      await saveUserProfile({ uid: user.uid, profileData });
      toast({ title: 'Success', description: 'Your information has been saved.' });
      router.push('/driver/aspirations');
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
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Skills, Passions, and Hobbies</CardTitle>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <DynamicFieldArray
                  name="skills"
                  label="Skills"
                  placeholder="e.g. Building gentle systems"
                  control={form.control}
                  register={form.register}
                />

                <DynamicFieldArray
                  name="passions"
                  label="Passions"
                  placeholder="e.g. Archetypal systems"
                  control={form.control}
                  register={form.register}
                />

                <DynamicFieldArray
                  name="interests"
                  label="Hobbies & Interests"
                  placeholder="e.g. Identity transformation"
                  control={form.control}
                  register={form.register}
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
