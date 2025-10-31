
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFieldArray, useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ArrowRight, Loader2, Save, ArrowLeft } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Role } from '@/models/role';
import Link from 'next/link';

const roleSchema = z.object({
  id: z.string().optional(),
  roleTitle: z.string().min(1, 'Role title is required.'),
  organizationContext: z.string().min(1, 'Organization/Context is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  keyResponsibilities: z.string().optional(),
  keyAccomplishments: z.string().optional(),
  whatILoved: z.string().optional(),
  whatIDisliked: z.string().optional(),
  heartExplosionsLevel: z.number().min(0).max(10),
});

const formSchema = z.object({
  roles: z.array(roleSchema),
});

type FormValues = z.infer<typeof formSchema>;

function RoleForm({ index, remove }: { index: number; remove: (index: number) => void }) {
  const { control, watch } = useFormContext<FormValues>();
  const sliderValue = watch(`roles.${index}.heartExplosionsLevel`);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="border-2 border-border rounded-lg p-6 relative bg-[#FAFFEE]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name={`roles.${index}.roleTitle`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Role Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Marketing Manager, Stay-at-home Parent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`roles.${index}.organizationContext`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Organization/Context</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ABC Company, Family, Local Nonprofit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-6">
        <FormField
          control={control}
          name={`roles.${index}.duration`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Duration</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jan 2020 - Present" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-6">
        <FormField
          control={control}
          name={`roles.${index}.keyResponsibilities`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Key Responsibilities</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-6">
        <FormField
          control={control}
          name={`roles.${index}.keyAccomplishments`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Key Accomplishments</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FormField
          control={control}
          name={`roles.${index}.whatILoved`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">What I Loved</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`roles.${index}.whatIDisliked`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">What I Disliked</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-6">
        <FormField
          control={control}
          name={`roles.${index}.heartExplosionsLevel`}
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel className="font-bold">Heart Explosions Level: {sliderValue}/10</FormLabel>
              <FormMessage />
              <FormControl>
                <div>
                  <Slider
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    max={10}
                    step={1}
                    {...rest}
                  />
                  <p className="text-sm text-muted-foreground mt-2">How aligned and energized did this role make you feel? (10 = highest alignment & passion)</p>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
       {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="absolute top-2 right-2"
          >
            Remove
          </Button>
        )}
    </motion.div>
  );
}

export function RolesClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const rolesCollectionRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'roles');
  }, [user?.uid, firestore]);
  
  const { data: rolesData, isLoading: isRolesLoading } = useCollection<Role>(rolesCollectionRef);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roles: [{
        roleTitle: '',
        organizationContext: '',
        duration: '',
        keyResponsibilities: '',
        keyAccomplishments: '',
        whatILoved: '',
        whatIDisliked: '',
        heartExplosionsLevel: 5,
      }],
    },
  });

  const { fields, append, remove, control } = useFieldArray({
    control: form.control,
    name: 'roles',
  });

  useEffect(() => {
    if (rolesData && rolesData.length > 0) {
      form.reset({ roles: rolesData });
    } else if (!isRolesLoading) {
      // Ensure at least one form is present if no data is fetched
      if(fields.length === 0) {
          append({
            roleTitle: '', organizationContext: '', duration: '',
            keyResponsibilities: '', keyAccomplishments: '', whatILoved: '',
            whatIDisliked: '', heartExplosionsLevel: 5,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesData, isRolesLoading, form.reset]);


  const onSubmit = async (data: FormValues) => {
    if (!user || !rolesCollectionRef) {
        toast({ title: 'Error', description: 'You must be logged in to save.', variant: 'destructive'});
        return;
    };
    setIsSaving(true);
    
    try {
        await Promise.all(data.roles.map(role => {
            const docRef = role.id ? doc(rolesCollectionRef, role.id) : doc(rolesCollectionRef);
            return setDoc(docRef, role, { merge: true });
        }));

        await saveUserProfile({ uid: user.uid, profileData: { driverCompleted: true } });

        toast({ title: 'Success', description: 'Your roles have been saved.' });
        router.push('/destination'); 

    } catch (error) {
        console.error("Error saving roles: ", error);
        toast({ title: 'Error', description: 'Could not save your roles.', variant: 'destructive'});
    } finally {
        setIsSaving(false);
    }
  };

  const isLoading = isUserLoading || isRolesLoading;

  return (
    <div>
        <Progress value={100} className="w-full mb-8 h-2" />

        <Card className="mb-8 bg-card/80">
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Past Roles & Experiences</CardTitle>
                <CardDescription>
                All paid and unpaid work (titles, industries, main duties) and significant volunteer roles, side projects, or caregiving roles.
                </CardDescription>
            </CardHeader>
        </Card>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin size-8" />
            </div>
        ) : (
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <AnimatePresence>
                        {fields.map((field, index) => (
                        <RoleForm key={field.id} index={index} remove={remove} />
                        ))}
                    </AnimatePresence>

                    <Card className="bg-card/80">
                        <CardContent className="p-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => append({
                                    roleTitle: '', organizationContext: '', duration: '',
                                    keyResponsibilities: '', keyAccomplishments: '', whatILoved: '',
                                    whatIDisliked: '', heartExplosionsLevel: 5
                                })}
                                >
                                <Plus className="mr-2" /> Add Another Role
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between mt-8">
                         <Button variant="outline" asChild>
                            <Link href="/driver/core-values"><ArrowLeft /> Previous</Link>
                        </Button>
                        <Button type="submit" disabled={isSaving} className="bg-primary-gradient font-bold text-primary-foreground">
                            {isSaving ? <Save className="mr-2 animate-spin" /> : 'Save & Complete Section'}
                            {!isSaving && <ArrowRight className="ml-2" />}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        )}
    </div>
  );
}
