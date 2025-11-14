'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-amber-200/20 blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-rose-200/20 blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-200/20 blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Washi tape at top */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-gradient-to-r from-amber-200/70 to-amber-300/70 border-t border-b border-amber-400/40 shadow-sm transform -rotate-1 z-20"></div>

        {/* Main card with paper texture */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          {/* Content */}
          <div className="relative p-8 pt-10">
            {/* Header with handwritten style */}
            <div className="text-center mb-8">
              <h1 className="text-4xl mb-2 text-gray-800" style={{ fontFamily: 'var(--font-title)' }}>
                Welcome Back!
              </h1>
              <p className="text-gray-600 text-sm">
                Open your journal and continue dreaming
              </p>
              
              {/* Decorative underline */}
              <div className="mt-3 flex justify-center">
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50/80 rounded-md border border-red-200/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-transparent border-b-2 border-gray-300 focus:border-primary transition-colors outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-transparent border-b-2 border-gray-300 focus:border-primary transition-colors outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-base font-medium shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Opening journal...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider with decorative dots */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white/95 text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Your are new?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 group"
                >
                  Start your idea journal
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </p>
            </form>
          </div>

          {/* Corner fold effect */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-gray-100/50 to-gray-200/80"></div>

          {/* Decorative dots in corner */}
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
          </div>
        </div>

        {/* Small decorative note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 italic" style={{ fontFamily: 'var(--font-title)' }}>
            "Every great idea starts with a single thought"
          </p>
        </div>
      </div>
    </div>
  );
}
