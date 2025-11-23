# This file is only for editing file nodes, do not break the structure
## Project Description
Instant Worksheet Generator AI - An educational tool that generates high-quality, curriculum-aligned academic worksheets for classes 3-12 using AI. Supports MCQs, Fill in the Blanks, Short Questions, and Match the Pairs with customizable difficulty levels.

## Key Features
- AI-powered worksheet generation with 4 question types
- Class selection (3-12) with difficulty levels (Easy/Medium/Hard)
- Real-time streaming worksheet generation
- Download worksheets as text files
- Email OTP authentication system
- Clean academic-focused design

## Data Storage
Local: Auth state persisted in localStorage (Zustand persist)

## Devv SDK Integration
Built-in: 
- Authentication (Email OTP)
- DevvAI (AI chat completions with streaming)

External: None

## Special Requirements
- Must generate worksheets in plain text format (no markdown unless requested)
- Questions must be original, curriculum-aligned, and age-appropriate
- Difficulty levels must be strictly followed
- All worksheets include 4 sections: MCQs (5), Fill in Blanks (5), Short Questions (5), Match Pairs (5)

## File Structure

/src
├── components/
│   ├── ui/              # Pre-installed shadcn/ui components
│   └── AuthDialog.tsx   # Email OTP login dialog component
│
├── hooks/
│   ├── use-mobile.ts    # Mobile detection Hook
│   └── use-toast.ts     # Toast notification system Hook
│
├── lib/
│   └── utils.ts         # Utility functions
│
├── pages/
│   ├── HomePage.tsx     # Main worksheet generator interface
│   └── NotFoundPage.tsx # 404 error page
│
├── store/
│   └── auth-store.ts    # Zustand auth state management with persistence
│
├── App.tsx              # Root component with routing
├── main.tsx             # Entry file
└── index.css            # Design system with academic blue theme
