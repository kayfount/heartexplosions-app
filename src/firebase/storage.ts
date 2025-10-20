
'use server';

import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdminApp } from '@/firebase/admin';

// Initialize the admin app to get the default bucket name
const adminApp = getFirebaseAdminApp();
const bucket = getStorage(adminApp).bucket();


/**
 * Uploads a file to Firebase Storage using the Admin SDK.
 * This is a server-side function.
 *
 * @param uid - The user's ID.
 * @param fileName - The name of the file.
 * @param fileType - The MIME type of the file.
 * @param fileBuffer - The file content as a Buffer.
 * @returns The public URL of the uploaded file.
 */
export async function uploadFile(
  uid: string,
  fileName: string,
  fileType: string,
  fileBuffer: Buffer
): Promise<string> {
  const filePath = `profile-pictures/${uid}/${fileName}`;
  const file = bucket.file(filePath);

  await file.save(fileBuffer, {
    metadata: {
      contentType: fileType,
      // Add a cache control header to ensure the browser fetches the new image
      cacheControl: 'public, max-age=0, must-revalidate',
    },
  });

  // Make the file public and get its URL
  await file.makePublic();

  // The public URL can be constructed directly and is more reliable.
  // The ?alt=media query parameter ensures the file is served directly.
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}
