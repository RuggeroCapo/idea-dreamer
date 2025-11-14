'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingScreen({ message = 'Loading your ideas...', showProgress = false }: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 300);

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated dotted paper background */}
      <div className="absolute inset-0 opacity-50">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0px 0px', '18px 18px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(160, 120, 80, 0.35) 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      {/* Main loading card */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative"
      >
        {/* Washi tape at top */}
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-7 bg-gradient-to-r from-amber-200/70 to-amber-300/70 border-t border-b border-amber-400/50 shadow-sm z-10"
          animate={{
            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Paper card */}
        <div className="relative bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-border p-12 min-w-[400px]">
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative space-y-8">
            {/* Animated pencil icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <svg
                  className="w-16 h-16 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                
                {/* Animated writing lines */}
                <motion.div
                  className="absolute -right-8 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: [0, 1, 0], x: [0, 20, 40] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                >
                  <div className="space-y-1">
                    <div className="h-0.5 w-8 bg-primary/40 rounded" />
                    <div className="h-0.5 w-6 bg-primary/30 rounded" />
                    <div className="h-0.5 w-4 bg-primary/20 rounded" />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Loading message with handwritten font */}
            <div className="text-center space-y-2">
              <h2
                className="text-2xl text-foreground"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                {message}
                <span className="inline-block w-8 text-left">{dots}</span>
              </h2>
            </div>

            {/* Animated dots indicator */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Progress bar (optional) */}
            {showProgress && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}
          </div>

          {/* Corner fold effect */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent via-muted/30 to-muted/60 transform rotate-0 origin-bottom-right" />

          {/* Decorative corner dots */}
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-30">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </div>
        </div>

        {/* Floating paper scraps animation */}
        <motion.div
          className="absolute -top-8 -left-8 w-6 h-6 bg-amber-200/40 rounded-sm shadow-sm"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-6 -right-6 w-8 h-8 bg-rose-200/40 rounded-sm shadow-sm"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </motion.div>
    </div>
  );
}
