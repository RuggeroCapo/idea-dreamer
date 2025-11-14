'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Moon, Sun, Save } from 'lucide-react';

const AREAS_OF_INTEREST = [
  'Technology', 'Business', 'Creative Arts', 'Science', 'Education',
  'Health & Wellness', 'Personal Development', 'Innovation', 'Design', 'Writing'
];

const THINKING_STYLES = [
  { value: 'visual', label: 'Visual', description: 'I think in images and diagrams' },
  { value: 'analytical', label: 'Analytical', description: 'I prefer logic and data' },
  { value: 'creative', label: 'Creative', description: 'I think outside the box' },
  { value: 'practical', label: 'Practical', description: 'I focus on real-world applications' },
];

const PRIMARY_USE_CASES = [
  { value: 'business_ideas', label: 'Business Ideas', description: 'Startup and business concepts' },
  { value: 'creative_projects', label: 'Creative Projects', description: 'Art, writing, design projects' },
  { value: 'learning', label: 'Learning', description: 'Study notes and insights' },
  { value: 'personal', label: 'Personal', description: 'Personal thoughts and reflections' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, isLoading: authLoading, updateProfile } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    areasOfInterest: [] as string[],
    professionalRole: '',
    professionalIndustry: '',
    thinkingStyle: '',
    primaryUseCase: '',
    notificationsEnabled: true,
    notificationsFrequency: 'daily',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        areasOfInterest: userProfile.profile.areasOfInterest || [],
        professionalRole: userProfile.profile.professionalContext?.role || '',
        professionalIndustry: userProfile.profile.professionalContext?.industry || '',
        thinkingStyle: userProfile.profile.thinkingStyle || '',
        primaryUseCase: userProfile.profile.primaryUseCase || '',
        notificationsEnabled: userProfile.profile.notificationPreferences?.enabled ?? true,
        notificationsFrequency: userProfile.profile.notificationPreferences?.frequency || 'daily',
      });
    }
  }, [userProfile]);

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: prev.areasOfInterest.includes(interest)
        ? prev.areasOfInterest.filter(i => i !== interest)
        : [...prev.areasOfInterest, interest]
    }));
  };

  const handleSave = async () => {
    if (!user || !userProfile) return;

    setIsLoading(true);
    setIsSaved(false);
    try {
      await updateProfile({
        profile: {
          areasOfInterest: formData.areasOfInterest,
          professionalContext: {
            role: formData.professionalRole,
            industry: formData.professionalIndustry,
          },
          thinkingStyle: formData.thinkingStyle,
          primaryUseCase: formData.primaryUseCase,
          notificationPreferences: {
            enabled: formData.notificationsEnabled,
            frequency: formData.notificationsFrequency,
          },
        },
        preferences: userProfile.preferences,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your preferences and profile</p>
            </div>
          </div>
          {isSaved && (
            <Badge variant="default" className="animate-pulse">
              Saved!
            </Badge>
          )}
        </div>

        {/* Theme Toggle Card */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how your journal looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleTheme}
                className="gap-2"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-5 w-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Areas of Interest */}
        <Card>
          <CardHeader>
            <CardTitle>Areas of Interest</CardTitle>
            <CardDescription>Topics that inspire you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AREAS_OF_INTEREST.map(interest => (
                <Badge
                  key={interest}
                  variant={formData.areasOfInterest.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Context */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Context</CardTitle>
            <CardDescription>Your work background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <input
                id="role"
                type="text"
                placeholder="e.g., Product Manager, Designer, Student"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={formData.professionalRole}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalRole: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="industry" className="text-sm font-medium">
                Industry
              </label>
              <input
                id="industry"
                type="text"
                placeholder="e.g., Technology, Healthcare, Education"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={formData.professionalIndustry}
                onChange={(e) => setFormData(prev => ({ ...prev, professionalIndustry: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Thinking Style */}
        <Card>
          <CardHeader>
            <CardTitle>Thinking Style</CardTitle>
            <CardDescription>How you process ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {THINKING_STYLES.map(style => (
                <Card
                  key={style.value}
                  className={`cursor-pointer transition-all ${
                    formData.thinkingStyle === style.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, thinkingStyle: style.value }))}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{style.label}</h3>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Primary Use Case */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Use Case</CardTitle>
            <CardDescription>How you use Idea Dreamer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {PRIMARY_USE_CASES.map(useCase => (
                <Card
                  key={useCase.value}
                  className={`cursor-pointer transition-all ${
                    formData.primaryUseCase === useCase.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, primaryUseCase: useCase.value }))}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{useCase.label}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
