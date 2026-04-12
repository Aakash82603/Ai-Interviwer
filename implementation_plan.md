# AI Interviewer - Implementation Plan

The goal is to convert the provided HTML/PNG files exported from Google Stitch into a robust, responsive React + TypeScript + Vite application. We'll implement a modern design system, set up Supabase for the backend (Auth + Database), integrate the Anthropic Claude API for AI features, and build complex in-browser media functionality (camera, speech recognition/synthesis, face tracking).

## User Review Required

> [!WARNING]  
> Before we begin adding the Claude API and Supabase integration, we need your API keys. Please add them to the `.env` file at the root. We won't be able to test those features properly without them. 

> [!IMPORTANT]  
> Calling the Anthropic API directly from the Vite front end is technically possible but leaks the API key to users. Do you have a preference for using a lightweight server/Edge Function for this, or should we keep it client-side for now for the sake of the MVP?
> (I will proceed with client-side API logic using environment variables if no backend is specified, just to keep the setup simple for the current Vite scaffolding).

> [!NOTE]  
> Setting up Speech API and Media devices requires secure contexts (`localhost` or `HTTPS`). The live room heavily relies on native browser APIs. Testing this locally will be fine on `localhost`.

## Proposed Changes

---

### Phase 1: Foundation & Setup
We will set up the core infrastructure, routing, and styling engine.

- **Tailwind CSS Initialization**: We'll install `tailwindcss`, `postcss`, and `autoprefixer`, and configure the `tailwind.config.js` to contain the specialized color palette and font families requested.
- **Design System Application**: Update `index.css` to define the base styles, background colors, and typography globally based on your specific requirements (e.g. background `#0b1326`, surface levels, electric blue primary, glassmorphism utilities).
- **React Router Setup**: Define all the routes mapped to corresponding blank wrapper components for each path (Landing, Dashboard, Live Interview, Mocks, Login, Mode Selector, Results, History, Profile).

#### [NEW] `tailwind.config.js`
#### [NEW] `postcss.config.js`
#### [MODIFY] `src/index.css`
#### [MODIFY] `src/App.tsx`
#### [MODIFY] `src/main.tsx`

---

### Phase 2: Supabase & DB Setup
We'll implement the authentication and database connection logic before wiring up the UIs.

- **Supabase Client**: Initialize the Supabase client using `.env` variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Database Types**: We will outline the exact tables required and create TypeScript types for the database schema (Users Profile, Sessions, Questions, Live Conversations, Daily Challenges, User Streaks, Challenge Completions).
- **Auth Provider Context**: Create an auth context for user management (Email/Pass, Google OAuth) and protecting routes (e.g., redirecting to `login_signup` if not logged in).

#### [NEW] `src/lib/supabase.ts`
#### [NEW] `src/contexts/AuthContext.tsx`
#### [NEW] `src/components/ProtectedRoute.tsx`

---

### Phase 3: Converting HTML/PNG Pages to React Components
We will systematically go through each folder and create a corresponding React functional component inside `src/pages`. The logic will be refactored into smaller, reusable components, incorporating Framer Motion for animations.

#### Landing, Dashboard, and Mocks
- Converting standard UI components, creating responsive layouts, applying glassmorphic cards, and integrating hover animations.
#### [NEW] `src/pages/LandingPage.tsx`
#### [NEW] `src/pages/Dashboard.tsx`
#### [NEW] `src/pages/CompanyMocks.tsx`

#### Live Interview Room
- Implement complex media handling: `getUserMedia` for webcam, `AudioContext` for visualizing mic input, local Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), and `face-api.js` for facial expressiveness or tracking.
- Set up streaming integration to handle conversation flows.
#### [NEW] `src/pages/LiveInterviewRoom.tsx`
#### [NEW] `src/components/Interview/CameraFeed.tsx`
#### [NEW] `src/components/Interview/AudioWaveform.tsx`

#### Additional Pages
- Converting the remaining logic for User Auth, Mode Selection, and Post-Interview Analysis pages.
#### [NEW] `src/pages/LoginSignup.tsx`
#### [NEW] `src/pages/ModeSelector.tsx`
#### [NEW] `src/pages/ResultsPage.tsx`
#### [NEW] `src/pages/HistoryPage.tsx`
#### [NEW] `src/pages/ProfilePage.tsx`

---

### Phase 4: Integrations (Claude API, AI features, Resume Upload)
We will connect everything. This logic handles the heavy lifting of calling the API for generating questions, evaluating answers, parsing resumes, and feeding daily challenges.

- Create a `src/lib/claude.ts` abstraction to talk to Anthropic API.
- Create streaks UI features using the Flame counter and calendar algorithms.
- Establish document parsing logic (for simplicity on frontend, we might read PDF text via `pdf.js` or ask Claude directly if supported, depending on the implementation path).

#### [NEW] `src/lib/claude.ts`
#### [NEW] `src/lib/pdfParser.ts`
#### [NEW] `src/components/Dashboard/StreakSystem.tsx`

## Open Questions
1. **Claude API**: Would you prefer me to just use client-side calls directly to Claude via `VITE_ANTHROPIC_API_KEY` for this MVP setup? 
2. **Face-api.js Models**: `face-api.js` needs model weights loaded to function. Should I download these to the `public/models` directory as part of the live interview setup phase?
3. **Database Creation**: For the Supabase database migrations, should I output the exact SQL commands into an `init.sql` file that you go and run in your Supabase SQL editor?

## Verification Plan
### Automated Tests
- Type checking: `npm run build` should pass without `tsc` errors.
- Pre-flight `npm run lint` validation.

### Manual Verification
- We will visually inspect that the landing page renders according to the HTML design but re-crafted into React/Tailwind.
- I'll write test code to ensure `getUserMedia` successfully attaches to a `<video>` tag locally.
- Validate Supabase auth routes actually lock down protected components.
