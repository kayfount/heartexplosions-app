'use client';

import { useState, useRef, ReactNode } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ProfilePictureUploaderProps {
  children: (props: { openFilePicker: () => void }) => ReactNode;
}

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];
const MAX_FILE_SIZE_MB = 15;

export function ProfilePictureUploader({ children }: ProfilePictureUploaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth || !user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload a photo.' });
      return;
    }
    if (isUploading) return;

    const file = event.target.files?.[0];
    if (!file) return;

    // --- Validation ---
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a valid image file (PNG, JPG, GIF, WEBP, HEIC).' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File Too Large', description: `Please select an image smaller than ${MAX_FILE_SIZE_MB}MB.` });
      return;
    }

    setIsUploading(true);
    const uploadToast = toast({ title: 'Uploading...', description: 'Your new profile picture is being uploaded.' });

    const storage = getStorage(auth.app);
    const fileExtension = file.type.split('/')[1] || 'png';
    const storageRef = ref(storage, `profile-pictures/${user.uid}/avatar.${fileExtension}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const timeout = setTimeout(() => {
      uploadTask.cancel();
      setIsUploading(false);
      uploadToast.dismiss();
      toast({ variant: 'destructive', title: 'Upload Timed Out', description: 'The upload took too long. Please check your connection and try again.' });
    }, 20000); // 20-second timeout

    uploadTask.on('state_changed',
      null, // No need for progress updates in this UI
      (error) => {
        clearTimeout(timeout);
        setIsUploading(false);
        uploadToast.dismiss();
        
        // Specifically ignore user-initiated cancellation or timeout cancellation
        if (error.code !== 'storage/canceled') {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message || 'An unknown error occurred.',
          });
        }
      },
      async () => {
        clearTimeout(timeout);
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateProfile(user, { photoURL: downloadURL });
          
          uploadToast.dismiss();
          toast({ title: 'Success!', description: 'Your profile picture has been updated.' });
        } catch (error: any) {
          uploadToast.dismiss();
          toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'Could not update your profile.' });
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_MIME_TYPES.join(',')}
        disabled={isUploading}
      />
      {children({ openFilePicker })}
    </>
  );
}
