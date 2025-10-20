
'use server';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseAdminApp } from '@/firebase/admin';

// Initialize the admin app to get the default bucket name
const adminApp = getFirebaseAdminApp();
const bucketName = process.env.GCLOUD_PROJECT + '.appspot.com';
const storage = getStorage(adminApp, `gs://${bucketName}`);


/**
 * Uploads a file to Firebase Storage.
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
  const storageRef = ref(storage, filePath);

  const metadata = {
    contentType: fileType,
  };

  await uploadBytes(storageRef, fileBuffer, metadata);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}
