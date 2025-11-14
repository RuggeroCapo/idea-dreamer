# Loading Components

Beautiful, artistic loading screens that match the journal/diary aesthetic of the application.

## Components

### LoadingScreen
Full-screen loading overlay with paper-like design, animated pencil icon, and washi tape decoration.

**Usage:**
```tsx
import { LoadingScreen } from '@/components/ui/loading-screen';

// Basic usage
<LoadingScreen message="Loading your ideas..." />

// With progress bar
<LoadingScreen message="Processing..." showProgress={true} />
```

**Features:**
- Animated dotted paper background
- Washi tape decoration at top
- Animated pencil icon with writing effect
- Pulsing dots indicator
- Optional progress bar
- Paper texture overlay
- Corner fold effect
- Floating paper scraps

### LoadingSpinner
Lightweight inline spinner for smaller loading states.

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Small size
<LoadingSpinner size="sm" message="Saving..." />

// Medium size (default)
<LoadingSpinner size="md" message="Loading..." />

// Large size
<LoadingSpinner size="lg" message="Processing..." />

// Without message
<LoadingSpinner size="md" />
```

**Sizes:**
- `sm`: 16px (w-4 h-4)
- `md`: 32px (w-8 h-8) - default
- `lg`: 48px (w-12 h-12)

## Current Implementation

The loading screen is currently used in:

1. **AuthProvider** - Initial app loading during authentication check
   - Message: "Preparing your journal..."

2. **Dashboard Page** - Loading user data and ideas
   - Message: "Loading your ideas..."
   - Also uses LoadingSpinner for fetching ideas

3. **Onboarding Page** - Loading during setup
   - Message: "Setting up your journal..."

## Design Philosophy

The loading components follow the application's artistic diary/journal aesthetic:

- **Colors**: Warm papery cream tones with amber accents
- **Typography**: Handwritten "Indie Flower" font for messages
- **Decorations**: Washi tape, paper textures, corner folds
- **Animations**: Smooth, organic movements (pencil writing, floating paper)
- **Background**: Dotted paper pattern matching the main app

## Customization

You can customize the loading screen by:

1. **Message**: Pass any string to the `message` prop
2. **Progress**: Enable with `showProgress={true}`
3. **Styling**: Add custom className to LoadingSpinner

## Examples

See `components/ui/loading-examples.tsx` for 10 different usage patterns including:
- Full-screen loading
- Inline loading states
- Button loading states
- Card overlays
- Conditional rendering
