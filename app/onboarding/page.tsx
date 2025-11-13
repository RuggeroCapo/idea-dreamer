'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, isLoading: authLoading, createProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && userProfile) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, userProfile, router]);

  const [formData, setFormData] = useState({
    areasOfInterest: [] as string[],
    professionalRole: '',
    professionalIndustry: '',
    thinkingStyle: '',
    primaryUseCase: '',
    notificationsEnabled: true,
    notificationsFrequency: 'daily',
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: prev.areasOfInterest.includes(interest)
        ? prev.areasOfInterest.filter(i => i !== interest)
        : [...prev.areasOfInterest, interest]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await createProfile({
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
        preferences: {
          defaultTags: [],
          ignoredCriticalities: [],
          preferredExpansionTypes: [],
        },
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = formData.areasOfInterest.length > 0;
  const canProceedStep2 = formData.professionalRole && formData.professionalIndustry;
  const canProceedStep3 = formData.thinkingStyle !== '';
  const canProceedStep4 = formData.primaryUseCase !== '';

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <div
                  key={num}
                  className={`h-2 w-12 rounded-full ${
                    num <= step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Step {step}/4</span>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && 'What are you interested in?'}
            {step === 2 && 'Tell us about your work'}
            {step === 3 && 'How do you think?'}
            {step === 4 && 'How will you use Idea Dreamer?'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Select topics that interest you (choose as many as you like)'}
            {step === 2 && 'Help us personalize your experience'}
            {step === 3 && 'This helps us tailor suggestions to your style'}
            {step === 4 && 'Choose your primary use case'}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[300px]">
          {step === 1 && (
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
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  What's your role?
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
                  What industry?
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
            </div>
          )}

          {step === 3 && (
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
          )}

          {step === 4 && (
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
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep(prev => prev + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedStep4 || isLoading}
            >
              {isLoading ? 'Setting up...' : 'Get Started'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
