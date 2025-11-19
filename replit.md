# Overview

Rehber360 is a comprehensive student guidance and management system (Öğrenci Rehberlik Sistemi) for Turkish educational institutions. It facilitates student progress tracking, counseling, survey management, and risk level monitoring. The system incorporates AI-powered insights and a robust Coaching System (Koçluk Sistemi) for academic and personal development. Key features include academic goal tracking (YKS, LGS, TYT, AYT, YDT exam preparation), Multiple Intelligence and Learning Style Assessments, a 360° Evaluation and Achievement System, daily self-assessments, parent collaboration, and AI-Powered Recommendations. It is a full-stack TypeScript application with a React frontend, Express backend, and SQLite database.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It employs React Router v6 for lazy-loaded client-side routing, React Query for server state, React Context for global state, and React hooks for local state management. The UI is built with custom components based on Radix UI primitives, styled with Tailwind CSS, and animated with Framer Motion following Shadcn/ui patterns. Design decisions include Server-Sent Events (SSE) for progressive loading, performance optimizations like memoization and code splitting, multi-layer caching, and PWA capabilities for offline support. Coaching features include dashboards for academic goal tracking, multiple intelligence radar charts, learning style analysis, SMART goal creation, 360° evaluation visualization, achievement badges, daily self-assessment forms, and parent/home visit management.

## Backend Architecture

The backend is built with Express 5.1.0 on Node.js 22, utilizing TypeScript. It uses SQLite with `better-sqlite3` for synchronous database operations. The architecture follows a feature-based modular pattern, organizing code by domain (e.g., coaching, students) with dedicated repositories, services, and routes. Key design decisions include a repository pattern for data access, a service layer for business logic, and centralized configuration. Security measures include CSRF protection, rate limiting, Zod for input validation, and cookie-based authentication with httpOnly cookies. Coaching services manage academic goals, assessments, AI recommendations, evaluations, achievements, and parent/family interactions.

## Data Storage Solutions

The primary database is SQLite, stored at `./data/database.db`, with schema migrations managed via versioned SQL files and synchronous queries. Key data models include `students`, `counseling_sessions`, `survey_templates`, `academic_records`, `risk_assessments`, `interventions`, `exam_sessions`, `guidance_categories`, `guidance_items`, and specific tables for the Coaching System like `academic_goals`, `multiple_intelligence`, `learning_styles`, `smart_goals`, `coaching_recommendations`, `evaluations_360`, `achievements`, `self_assessments`, `parent_meetings`, `home_visits`, and `family_participation`. The system supports manual and automatic backups.

## Authentication and Authorization

Authentication is cookie-based using httpOnly cookies. The system supports user roles such as `admin`, `counselor`, `teacher`, and `observer`. Authorization is role-based, enforced on both the frontend and backend, with context-based authorization for React components. Security features include bcryptjs for password hashing, CSRF token validation, rate limiting on authentication endpoints, and secure cookie settings.

## UI/UX Design Decisions

The design follows an "zarif ve şık minimal kompakt" (elegant, chic, minimal, compact) aesthetic with a refined color palette (99.5% background in light mode, softer indigo primary color), and subtle borders. Accessibility is prioritized with 44px minimum touch targets, WCAG 2.2 compliant focus indicators (≥3:1 contrast), and good contrast ratios (light mode ~5.1:1, dark mode ~3.4:1). Typography uses a 15px base font size with lighter heading weights for compactness and refined readability. Component designs are compact and minimal, with reduced padding, smaller border radii (0.875rem), and subtle visual effects like 200ms transitions and light shadows.

# External Dependencies

## AI Services

-   **OpenAI Integration**: Utilizes GPT-4 for advanced student analysis, intervention recommendations, and predictive analytics, configured via `OPENAI_API_KEY`.
-   **Google Gemini Integration**: Provides an alternative AI provider for analysis and chat features, configured via `GEMINI_API_AT`.
-   **Ollama (Local AI)**: Supports local LLM deployments for privacy or as a fallback, configured via `OLLAMA_BASE_URL`.
-   **AI Feature Usage**: Powers student risk prediction, automated action plans, survey sentiment analysis, multi-student comparative analysis, and class-wide performance insights.

## Third-Party Services

-   **Email Notifications**: SMTP configuration for sending notifications.
-   **SMS Notifications**: Integration with Turkish SMS providers for parent communication.

## Key NPM Dependencies

-   **Frontend**: `react`, `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-virtual`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-markdown`, `date-fns`, `framer-motion`.
-   **Backend**: `express`, `better-sqlite3`, `bcryptjs`, `cookie-parser`, `cors`, `csrf-csrf`, `express-rate-limit`, `dotenv`, `multer`, `jspdf`, `xlsx`, `uuid`.
-   **Development**: `vite`, `typescript`, `tailwindcss`, `eslint`, `@vitejs/plugin-react-swc`.

## External APIs and Integrations

-   **Turkish Education System Compliance**: Adherence to MEB standards, tracking of Turkish standardized exams (LGS, TYT, AYT, YDT), and Turkish localization. Includes a hierarchical guidance standards system with an automated markdown-to-database pipeline.
-   **File Processing**: Supports Excel import/export, PDF generation for reports, and image uploads.
-   **Progressive Web App**: Features a service worker for offline functionality, an app manifest, and optional push notifications.