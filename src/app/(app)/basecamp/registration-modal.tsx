
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
import { useState } from 'react';

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
  onRegister: (data: RegistrationFormValues) => void;
  isRegistered: boolean;
}

const journeyStatuses = [
    "Just considering a change",
    "Preparing to make a move",
    "Actively transitioning",
    "Not looking to change right now"
];

export function RegistrationModal({ isOpen, onOpenChange, onRegister, isRegistered }: RegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        onRegister(data);
        setIsSubmitting(false);
        onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-light-box-surface border-foreground/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Tent className="size-6 text-foreground" />
            <DialogTitle className="text-2xl font-bold font-headline text-foreground">
              Join the Heart Explosions Expedition
            </DialogTitle>
          </div>
          <DialogDescription className="text-foreground/80">
            Complete your registration to begin your journey of purpose-driven transformation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="journeyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where are you in your journey? *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your current status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{journeyStatuses.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
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
      </DialogContent>
    </Dialog>
  );
}
