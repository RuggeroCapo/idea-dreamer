import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AuthState {
  user: Models.User<Models.Preferences> | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, 'userId' | 'createdAt' | 'lastActive'>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          await account.createEmailPasswordSession(email, password);
          const user = await account.get();

          // Fetch user profile
          try {
            const profileDoc = await databases.getDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              user.$id
            );
            // Parse JSON strings back to objects
            const profile: UserProfile = {
              userId: profileDoc.userId as string,
              profile: typeof profileDoc.profile === 'string' ? JSON.parse(profileDoc.profile) : profileDoc.profile,
              preferences: typeof profileDoc.preferences === 'string' ? JSON.parse(profileDoc.preferences) : profileDoc.preferences,
              createdAt: profileDoc.createdAt as string,
              lastActive: profileDoc.lastActive as string,
            };
            set({
              user,
              userProfile: profile,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            // Profile doesn't exist yet
            set({
              user,
              userProfile: null,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true });
          await account.create(ID.unique(), email, password, name);
          await account.createEmailPasswordSession(email, password);
          const user = await account.get();

          set({
            user,
            userProfile: null,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await account.deleteSession('current');
          set({
            user: null,
            userProfile: null,
            isAuthenticated: false
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const user = await account.get();

          // Fetch user profile
          try {
            const profileDoc = await databases.getDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              user.$id
            );
            // Parse JSON strings back to objects
            const profile: UserProfile = {
              userId: profileDoc.userId as string,
              profile: typeof profileDoc.profile === 'string' ? JSON.parse(profileDoc.profile) : profileDoc.profile,
              preferences: typeof profileDoc.preferences === 'string' ? JSON.parse(profileDoc.preferences) : profileDoc.preferences,
              createdAt: profileDoc.createdAt as string,
              lastActive: profileDoc.lastActive as string,
            };
            set({
              user,
              userProfile: profile,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            // Profile doesn't exist yet
            set({
              user,
              userProfile: null,
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error) {
          set({
            user: null,
            userProfile: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      createProfile: async (profileData) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');

        try {
          const now = new Date().toISOString();
          const profile: UserProfile = {
            ...profileData,
            userId: user.$id,
            createdAt: now,
            lastActive: now,
          };

          // Flatten the nested structure for Appwrite
          const flattenedProfile = {
            userId: profile.userId,
            // Store nested objects as JSON strings
            profile: JSON.stringify(profile.profile),
            preferences: JSON.stringify(profile.preferences),
            createdAt: profile.createdAt,
            lastActive: profile.lastActive,
          };

          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id,
            flattenedProfile
          );

          set({ userProfile: profile });
        } catch (error) {
          console.error('Error creating profile:', error);
          throw error;
        }
      },

      updateProfile: async (profileUpdate) => {
        const { user, userProfile } = get();
        if (!user || !userProfile) throw new Error('User not authenticated');

        try {
          const updatedProfile = {
            ...userProfile,
            ...profileUpdate,
            lastActive: new Date().toISOString(),
          };

          // Flatten the nested structure for Appwrite
          const flattenedProfile = {
            userId: updatedProfile.userId,
            profile: JSON.stringify(updatedProfile.profile),
            preferences: JSON.stringify(updatedProfile.preferences),
            createdAt: updatedProfile.createdAt,
            lastActive: updatedProfile.lastActive,
          };

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            user.$id,
            flattenedProfile
          );

          set({ userProfile: updatedProfile });
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
