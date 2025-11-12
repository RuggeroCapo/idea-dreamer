import { Client, Account, Databases, ID } from 'appwrite';

const client = new Client();

// These values should be set from environment variables
// For now, we'll use placeholder values that users need to configure
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs - these should be created in Appwrite console
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || '',
  IDEAS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_IDEAS || '',
  TAGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TAGS || '',
};

export { ID };
export default client;
