
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
import { Tent, Loader2, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth, useDoc, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { updateProfileAction, saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { updateProfile } from 'firebase/auth';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  callSign: z.string().optional(),
  journeyStatus: z.string().min(1, 'Please select your journey status.'),
  whyNow: z.string().optional(),
  profilePicture: z.any().optional(),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRegister: (data: Partial<RegistrationFormValues>) => void;
  isRegistered: boolean;
}

const journeyStatuses = [
    "Just considering a change",
    "Preparing to make a move",
    "Actively transitioning",
    "Not looking to change right now"
];

export function RegistrationModal({ isOpen, onOpenChange, onRegister, isRegistered }: RegistrationModalProps) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useMemo(() => auth ? getFirestore(auth.app) : null, [auth]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);
  
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

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
    if (isOpen) {
        if (userProfile) {
            form.reset({
                firstName: userProfile.firstName || user?.displayName?.split(' ')[0] || '',
                lastName: userProfile.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '',
                callSign: userProfile.callSign || '',
                journeyStatus: userProfile.journeyStatus || '',
                whyNow: userProfile.whyNow || '',
            });
        } else if (user) {
            const nameParts = user.displayName?.split(' ') || ['', ''];
            form.reset({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                callSign: '',
                journeyStatus: '',
                whyNow: '',
            });
        }
        if (user?.photoURL) {
            setPreviewUrl(user.photoURL);
        }
    }
  }, [user, userProfile, form, isOpen]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !auth?.currentUser) return;
    
    setIsUploading(true);

    // Create a temporary local URL for immediate preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      const result = await updateProfileAction({
        uid: user.uid,
        file: file,
      });

      if (result.success && result.photoURL) {
        // Manually update the user profile on the client to force a re-render
        // across all components using the useUser hook.
        await updateProfile(auth.currentUser, { photoURL: result.photoURL });
        
        toast({
          title: 'Profile Picture Updated',
          description: 'Your new picture has been saved.',
        });
      } else {
         throw new Error(result.error || 'The server did not return a new photo URL.');
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Could not upload your picture.',
      });
      // Revert preview if upload fails
      setPreviewUrl(user.photoURL || null);
    } finally {
        setIsUploading(false);
        // Clean up the local URL
        if(localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    }
  };


  const onSubmit = async (data: RegistrationFormValues) => {
    if (!user || !auth?.currentUser) return;
    setIsSubmitting(true);
    
    try {
      const displayName = `${data.firstName} ${data.lastName}`.trim();
      
      const profileDataToUpdate: { uid: string; displayName?: string } = { uid: user.uid };
      if (displayName !== user.displayName) {
        profileDataToUpdate.displayName = displayName;
      }

      if (profileDataToUpdate.displayName) {
        const result = await updateProfileAction(profileDataToUpdate);
        if (!result.success) {
          throw new Error(result.error);
        }
        // Manually update client state
        await updateProfile(auth.currentUser, { displayName });
      }

      const { firstName, lastName, callSign, journeyStatus, whyNow } = data;
      await saveUserProfile({
        uid: user.uid,
        profileData: {
            firstName,
            lastName,
            callSign,
            journeyStatus,
            whyNow,
        }
      });
      
      onRegister(data);
      toast({
        title: 'Profile Updated',
        description: 'Your expedition details have been saved.',
      });
      onOpenChange(false);

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Uh oh!',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userImage = previewUrl || user?.photoURL || "https://picsum.photos/seed/avatar1/100/100";
  const userInitial = user?.displayName?.charAt(0) || 'U';

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
             <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={userImage} key={userImage} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn("absolute bottom-0 right-0 rounded-full bg-secondary", isUploading && "cursor-not-allowed")}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/gif"
                  disabled={isUploading}
                />
              </div>
            </div>
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
                   <Select onValueChange={field.onChange} value={field.value}>
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
                <Button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-primary-gradient text-primary-foreground font-bold">
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
