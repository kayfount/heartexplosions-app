
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Tent, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useAuth, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  callSign: z.string().optional(),
  journeyStatus: z.string().min(1, 'Please select your journey status.'),
  whyNow: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRegister: () => void;
  isRegistered: boolean;
}

const journeyStatuses = [
    "Just considering a change",
    "Preparing to make a move",
    "Actively transitioning",
    "Not looking to change right now"
];

export function RegistrationModal({ isOpen, onOpenChange, onRegister, isRegistered }: RegistrationModalProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      callSign: '',
      journeyStatus: '',
      whyNow: '',
    },
  });

  useEffect(() => {
    if (!isOpen || isUserLoading || isProfileLoading) return;

    const name = user?.displayName || '';
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    form.reset({
      firstName: userProfile?.firstName || firstName || '',
      lastName: userProfile?.lastName || lastName || '',
      callSign: userProfile?.callSign || '',
      journeyStatus: userProfile?.journeyStatus || '',
      whyNow: userProfile?.whyNow || '',
    });
  }, [user, userProfile, form, isUserLoading, isProfileLoading, isOpen]);
  
  const onSubmit = async (data: RegistrationFormValues) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { firstName, lastName, ...profileData } = data;
      const displayName = `${firstName} ${lastName}`.trim();
      
      const payload = {
        firstName,
        lastName,
        displayName,
        ...profileData
      };

      const result = await saveUserProfile({ uid: user.uid, profileData: payload });
      
      if (result.success) {
          onRegister();
          toast({
            title: isRegistered ? 'Profile Updated' : 'Registration Complete!',
            description: 'Your expedition details have been saved.',
          });
          onOpenChange(false);
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not save your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-light-box-surface border-foreground/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Tent className="size-6 text-foreground" />
            <DialogTitle className="text-2xl font-bold font-headline text-foreground">
              {isRegistered ? 'Update Your Expedition' : 'Join the Heart Explosions Expedition'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-foreground/80">
            {isRegistered ? 'Update your registration details below.' : 'Complete your registration to begin your journey of purpose-driven transformation.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin size-8" />
          </div>
        ) : (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-8">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="callSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Sign (Trail Name)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Your call sign is how you'll be addressed throughout your journey. Leave blank to use your first name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="journeyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where are you in your journey? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your current status" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>{journeyStatuses.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whyNow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why does this matter to you right now?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., I'm ready to take intentional action, I'm tired of feeling stuck..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-gradient text-primary-foreground font-bold">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isRegistered ? 'Update My Expedition' : 'Begin My Expedition'}
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
