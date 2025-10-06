# **App Name**: Heart Compass

## Core Features:

- Basecamp (Registration Wizard): Guided onboarding that helps users clarify their current season, constraints, values, strengths, interests, and time budget. Outputs a personalized “Starting Point” summary that feeds into the dashboard and AI tools.
- The Driver (Reveal Stage): Form sequence that captures the user’s Enneagram Type, Wing, Instinctual Stacking, and Tritype. AI (Gemini) analyzes responses to generate a Life Purpose Report—outlining the user’s natural genius, growth edge, motivations, and core values. Exports as a PDF and optional ElevenLabs audio file; both saved to Firebase Storage and linked to user authentication.
- The Destination (Decide Stage): User selects one focus area—career, contribution, or calling. AI synthesizes insights into a Purpose Profile, identifying the most aligned path and providing “edge of choosing” prompts and quick wins.
- The Route (Sustainable Roadmap): AI tool creates a realistic Route Plan based on the user’s available hours, commitments, and timeline. Includes milestones, weekly action steps, pacing suited to real capacity, and integrated progress tracking.
- Trail Angels (Insights Hub): Centralized library for all reports, route plans, and audio files. Allows users to re-read, download, or play ElevenLabs audio directly in-app. Filter by Driver, Destination, or Route for easy navigation. Allows user to interact with AI Coach. Allows users to download other helpful guides, supports, systems, trainings, and strategies I provide them.
- Progress & Reflection Tracking: Interactive checkboxes, completion percentages, and streak tracking with motivational animations. Includes milestone celebrations and “Reflection Prompts” to encourage ongoing engagement.
- AI Integrations: Claude for text-based generation within the AI Coach and Life Purpose Report. Gemini for text-based generation of main app sections and specialized sections like The Destination's role cards. ElevenLabs for text-to-speech voiceovers. Zapier + Notion (future) for exporting reports or roadmaps into user workspaces.
- User Authentication: Firebase Authentication for user accounts with email/password, with plans to add Google/Apple login options.

## Style Guidelines:

- Deep Teal (Text/Borders): #072F29
- Sage Tint: #D3EFDB
- Off-White: #FAFFEE
- Emerald (Primary Action): #169D53
- Light Box Surface: #E6F7E5
- Accent Gold: #BEBE1C
- Coral: #FF5940
- Deep Red: #FA452D
- Primary Gradient (Buttons & CTAs): #169D53 → #BEBE1C
- Background Gradient: subtle blend of #FAFFEE → #D3EFDB
- Dark Text & Borders: #072F29
- Buttons - Primary: background #169D53, white text, no border. Hover: slightly darker Emerald; text stays white. Focus ring: #072F29 at 40% opacity.
- Buttons - Secondary / Light: background #FAFFEE, dark text #072F29, border #072F29 (1–2px). Hover: background + border shift to #169D53, text turns white.
- Rounded Corners: rounded-lg (~12px); pill-shaped for small tags or favorites (rounded-full).
- Cards (Destination, Wildcards, Reports) - Base fills: #FAFFEE or #D3EFDB. Text & borders: #072F29. Accents (icons, highlights): #169D53. Rounded Corners: rounded-xl (~16px). Soft shadow + subtle border (20–30% opacity Deep Teal). Active/selected border: full #169D53
- Large Color Blocks (Hero Panels / Section Wrappers) - Rounded corners: rounded-2xl (~20–24px). Border: 1–2px #072F29. Optional hover: gentle shadow (no radius change)
- Rounded icons representing each section (Basecamp, Driver, Destination, Route, Trail Angels).
- Gentle hover glows, gradient transitions on CTAs, and celebratory animations (“Confetti Explosion” or “Victory Dance”) upon milestone completion.
- Logo text gradient: #FA452D → #BEBE1C → #169D53 with animated, floating star above heart icon.
- Warm, expedition-inspired aesthetic with clear progress markers and a motivational tone. Micro-wins and visual progress cues encourage consistent yet compassionate pacing—helping users move forward while honoring real-world capacity.
- Body and headline font: 'PT Sans', a modern sans-serif that combines a modern look and a little warmth or personality; great for readability and a friendly feel.
- Code font: 'Source Code Pro' for displaying configuration snippets.
- Use simple, intuitive icons representing various stages of the user's journey and different aspects of the planning process.
- Subtle transitions and celebratory micro-animations upon completing tasks or reaching milestones to encourage user engagement.