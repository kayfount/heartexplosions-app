'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateProfileAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface ProfilePictureUploaderProps {
  children: (props: { openFilePicker: () => void, isUploading: boolean }) => ReactNode;
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
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // --- Pre-Upload Checks ---
    if (isUploading) return;
    if (!auth || !user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload a photo.' });
      return;
    }

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
    
    // Optimistic Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uid', user.uid);

    const result = await updateProfileAction(formData);

    setIsUploading(false);
    setPreviewUrl(null); // Clear preview after operation

    if (result.success) {
      toast({ title: 'Success!', description: 'Your profile picture has been updated.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }

     // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
     // Ensure user is loaded before allowing picker to open
    if (isUserLoading || !user) {
        toast({ title: "Please wait", description: "Authentication is still loading."});
        return;
    }
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
        disabled={isUploading || isUserLoading}
      />
      {children({ openFilePicker, isUploading })}
    </>
  );
}
