# Idea Dreamer - AI-Powered Idea Collection System

An intelligent mobile-first application for capturing, organizing, and exploring ideas with AI assistance. Transform raw thoughts into actionable insights through AI-guided exploration.

## Features

- **Quick Idea Capture**: Fast, frictionless idea recording with mobile-optimized interface
- **AI-Powered Tagging**: Automatic categorization using Google Gemini AI
- **Guided Exploration**: Non-linear exploration paths for developing ideas
- **Living Documents**: Auto-updating summaries that evolve as you explore
- **Diary View**: Beautiful timeline of your ideas with search and filtering
- **User Profiles**: Personalized AI suggestions based on your interests and thinking style

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **State Management**: Zustand with persistence
- **UI Components**: Shadcn UI with Tailwind CSS
- **Animations**: Framer Motion
- **Backend & Auth**: Appwrite
- **AI Integration**: Google Gemini Flash (via @google/generative-ai)
- **Date Formatting**: date-fns

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm installed
- An Appwrite account and project
- A Google AI Studio API key for Gemini

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd idea-dreamer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Appwrite

1. Go to [Appwrite Cloud](https://cloud.appwrite.io) or use your self-hosted instance
2. Create a new project
3. Note your Project ID and API Endpoint
4. Create a new database and note its ID
5. Create three collections:

   **Users Collection:**
   - Collection ID: (note this for later)
   - Attributes:
     - `userId` (String, required)
     - `profile` (String/JSON, required)
     - `preferences` (String/JSON, required)
     - `createdAt` (String, required)
     - `lastActive` (String, required)

   **Ideas Collection:**
   - Collection ID: (note this for later)
   - Attributes:
     - `ideaId` (String, required)
     - `userId` (String, required)
     - `originalIdea` (String/JSON, required)
     - `tags` (String/JSON, required)
     - `exploration` (String/JSON, required)
     - `document` (String/JSON, required)
     - `connections` (String/JSON, required)
     - `metadata` (String/JSON, required)

   **Tags Collection:**
   - Collection ID: (note this for later)
   - Attributes:
     - `tagId` (String, required)
     - `name` (String, required)
     - `category` (String, optional)
     - `color` (String, required)
     - `usageCount` (Integer, required)
     - `createdAt` (String, required)

6. Configure permissions for each collection (read/write access for authenticated users)

### 4. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Note the API key for the next step

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=your_users_collection_id_here
NEXT_PUBLIC_APPWRITE_COLLECTION_IDEAS=your_ideas_collection_id_here
NEXT_PUBLIC_APPWRITE_COLLECTION_TAGS=your_tags_collection_id_here

# Google Gemini API Configuration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
idea-dreamer/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── dashboard/          # Main dashboard
│   ├── idea/[ideaId]/     # Idea detail view
│   ├── onboarding/        # User onboarding
│   └── page.tsx           # Root redirect
├── components/             # React components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── IdeaCaptureModal.tsx
│   │   └── IdeaCard.tsx
│   └── ui/               # UI primitives (Shadcn)
├── lib/                  # Utilities and configurations
│   ├── appwrite.ts      # Appwrite client setup
│   ├── gemini.ts        # Google Gemini AI functions
│   └── utils.ts         # Helper functions
├── store/               # Zustand state management
│   ├── authStore.ts    # Authentication state
│   └── ideasStore.ts   # Ideas state
└── types/              # TypeScript type definitions
    └── index.ts
```

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account on the signup page
2. **Onboarding**: Complete the 4-step questionnaire to personalize your experience
3. **Capture Ideas**: Use the floating action button (+) to capture your first idea
4. **Explore**: Click on any idea to explore it with AI assistance

### Capturing Ideas

1. Click the (+) button (FAB) on the dashboard
2. Type or speak your idea (50-200 characters recommended)
3. Review AI-suggested tags
4. Save and start exploring

### Exploring Ideas

1. Click on any idea card to open the detail view
2. Choose an exploration tab:
   - **Expansion**: Develop different angles of your idea
   - **Criticalities**: Identify challenges and obstacles (coming soon)
   - **Opportunities**: Discover potential applications (coming soon)
3. Click on exploration directions to generate AI content
4. The document summary updates automatically

## MVP Status

This is an MVP (Minimum Viable Product) with the following features implemented:

- ✅ User authentication (signup/login)
- ✅ Onboarding questionnaire
- ✅ Idea capture with AI tag generation
- ✅ Diary view with idea cards
- ✅ Idea detail view with document summary
- ✅ Expansion prompts tab with AI content generation
- ✅ Auto-updating document summaries
- 🚧 Criticalities tab (UI ready, functionality pending)
- 🚧 Opportunities tab (UI ready, functionality pending)
- 🚧 Connection discovery between ideas
- 🚧 Search and filtering
- 🚧 Export functionality

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Deploy to Appwrite (Recommended)

Follow the [Appwrite deployment guide](https://appwrite.io/docs/products/functions/deployment) for deploying Next.js applications.

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Issue: Appwrite connection fails

- Verify your project ID and endpoint in `.env.local`
- Check that your Appwrite project is accessible
- Ensure collections are created with correct IDs

### Issue: AI tag generation not working

- Verify your Gemini API key is correct
- Check API quota limits in Google AI Studio
- Ensure `GOOGLE_GEMINI_API_KEY` is set in `.env.local`

### Issue: Build errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (18+)

## Contributing

This is an MVP. Contributions are welcome! Areas for improvement:

- Implement criticalities and opportunities tabs
- Add connection discovery algorithm
- Implement search and filtering
- Add export functionality (PDF, Markdown)
- Mobile app version (React Native)
- Offline support with sync

## License

MIT License - feel free to use this project for your own ideas!

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Backend by [Appwrite](https://appwrite.io/)

---

**Happy Idea Dreaming! 💡**
