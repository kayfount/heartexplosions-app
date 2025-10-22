
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
import { Tent, Loader2, Camera, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useAuth, useDoc, useMemoFirebase, useStorage } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, type User } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { UserProfile } from '@/models/user-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
  onRegister: (data: Partial<RegistrationFormValues>) => void;
  isRegistered: boolean;
}

const journeyStatuses = [
    "Just considering a change",
    "Preparing to make a move",
    "Actively transitioning",
    "Not looking to change right now"
];

// --- Photo Upload Constants ---
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
};
const UPLOAD_TIMEOUT_MS = 20000; // 20 seconds

export function RegistrationModal({ isOpen, onOpenChange, onRegister, isRegistered }: RegistrationModalProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const firestore = useMemo(() => auth ? getFirestore(auth.app) : null, [auth]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const name = user?.displayName || '';
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || firstName || '',
        lastName: userProfile.lastName || lastName || '',
        callSign: userProfile.callSign || '',
        journeyStatus: userProfile.journeyStatus || '',
        whyNow: userProfile.whyNow || '',
      });
    } else if (user) {
        form.reset({
            firstName: firstName || '',
            lastName: lastName || '',
            callSign: '',
            journeyStatus: '',
            whyNow: '',
        });
    }
  }, [user, userProfile, form]);

  const handleAvatarClick = () => {
      if(isUploading) return;
      fileInputRef.current?.click();
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Firebase Auth is not available.' });
        return;
    }
    const storageService = storage;
    if (!storageService) {
        toast({ variant: 'destructive', title: 'Storage Error', description: 'Firebase Storage is not available.' });
        return;
    }

    if (!auth.currentUser) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload a photo.' });
        return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    // --- Validation ---
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a PNG, JPG, WEBP, or GIF file.' });
        return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: 'destructive', title: 'File Too Large', description: `Please select a file smaller than ${MAX_FILE_SIZE_MB} MB.` });
        return;
    }

    // --- Start Upload Process ---
    setIsUploading(true);
    const previousAvatar = optimisticAvatarUrl || user?.photoURL || null;
    const objectURL = URL.createObjectURL(file);
    setOptimisticAvatarUrl(objectURL);

    const uid = auth.currentUser.uid;
    const fileExtension = MIME_TYPE_TO_EXTENSION[file.type] || 'jpg';
    const storagePath = `users/${uid}/profile.${fileExtension}`;
    const storageRef = ref(storageService, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });
    
    let isTimeout = false;
    const timeoutId = setTimeout(() => {
        isTimeout = true;
        uploadTask.cancel();
        setIsUploading(false);
        setOptimisticAvatarUrl(previousAvatar);
        toast({ variant: 'destructive', title: 'Upload Timed Out', description: 'The upload took too long. Please check your connection and try again.' });
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on('state_changed', 
      () => {}, // Progress handler can be implemented here
      (error) => { // Error handler
        clearTimeout(timeoutId);
        setIsUploading(false);
        setOptimisticAvatarUrl(previousAvatar);
        
        // Don't show a toast if the error is a user-initiated cancel from the timeout
        if (error.code === 'storage/canceled' && isTimeout) {
            console.log("Upload timed out and was canceled.");
            return;
        }

        console.error("Upload error:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not upload your photo.' });
      },
      async () => { // Completion handler
        clearTimeout(timeoutId);
        if (isTimeout) return;
        
        try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (auth.currentUser) {
              await updateProfile(auth.currentUser, { photoURL: downloadURL });
            }
            if (firestore) {
              await setDoc(doc(firestore, 'users', uid), { photoURL: downloadURL }, { merge: true });
            }
            
            setOptimisticAvatarUrl(downloadURL); // Set final URL
            toast({ title: 'Avatar Updated!', description: 'Your new profile picture has been saved.' });
        } catch (error: any) {
            setOptimisticAvatarUrl(previousAvatar);
            console.error("Profile update error:", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not save the new photo to your profile.' });
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(objectURL); // Clean up memory
        }
      }
    );
  };
  
  const onSubmit = async (data: RegistrationFormValues) => {
    if (!user || !auth?.currentUser || !firestore || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { firstName, lastName, callSign, journeyStatus, whyNow } = data;
      const displayName = `${firstName} ${lastName}`.trim();
      
      if (displayName && displayName !== user.displayName) {
         await updateProfile(auth.currentUser, { displayName });
      }

      await setDoc(
        doc(firestore, 'users', user.uid),
        { firstName, lastName, callSign, journeyStatus, whyNow, displayName, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      
      onRegister(data);
      toast({
        title: isRegistered ? 'Profile Updated' : 'Registration Complete!',
        description: 'Your expedition details have been saved.',
      });
      onOpenChange(false);

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
  const currentAvatarUrl = optimisticAvatarUrl || user?.photoURL;
  const userInitials = `${form.getValues('firstName')?.[0] || ''}${form.getValues('lastName')?.[0] || ''}` || 'U';

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
            <div className="flex justify-center my-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-border/20 shadow-md">
                  <AvatarImage src={currentAvatarUrl ?? undefined} alt="User Avatar" />
                  <AvatarFallback className="text-3xl bg-secondary">
                      {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                {isUploading && (
                    <div aria-busy="true" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-white size-8" />
                    </div>
                )}
                
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-2 bg-background hover:bg-secondary group-hover:shadow-lg transition-shadow"
                >
                    <Camera className="w-5 h-5" />
                </Button>
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={ALLOWED_MIME_TYPES.join(',')}
                />
              </div>
            </div>

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
                    <Button type="submit" disabled={isSubmitting || isUploading} className="w-full bg-primary-gradient text-primary-foreground font-bold">
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
