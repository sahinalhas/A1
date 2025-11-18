# Overview

Rehber360 is a comprehensive student guidance and management system (Öğrenci Rehberlik Sistemi) designed for educational institutions in Turkey. It empowers counselors, teachers, and administrators to track student progress, conduct counseling, manage surveys, generate AI-powered insights, and monitor student risk levels.

The system features a robust **Coaching System** (Koçluk Sistemi) that supports academic and personal development. Key capabilities include:
- Academic Goal Tracking (YKS, LGS, TYT, AYT, YDT exam preparation)
- Multiple Intelligence and Learning Style Assessments
- 360° Evaluation and Achievement System (gamification)
- Daily Self-Assessment for holistic well-being
- Parent Collaboration and documentation
- AI-Powered Recommendations for personalized guidance
- Comprehensive Progress Monitoring dashboards

Rehber360 is a full-stack TypeScript application utilizing a React frontend, an Express backend, and SQLite for data persistence.

## Quick Start

### Development
The application runs on port 5000 with both frontend (Vite) and backend (Express) integrated:
```bash
npm run dev
```

### Default Credentials
After first run, use these credentials to login:
- **Email**: admin@okul.edu.tr
- **Password**: admin123

### Environment Setup
The `.env` file is created from `.env.example` with sensible defaults. For AI features, configure at least one provider:
- `OPENAI_API_KEY` - For GPT models
- `GEMINI_API_KEY` - For Google Gemini
- `OLLAMA_BASE_URL` - For local AI (default: http://localhost:11434)

### Deployment
The app is configured for Replit autoscale deployment:
```bash
npm run build  # Builds both frontend and backend
npm run start  # Runs production server
```

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite.
**Routing**: React Router v6 for client-side routing with lazy loading.
**State Management**: React Query for server state caching, React Context for global state, and React hooks for local state.
**UI Component Library**: Custom system built on Radix UI primitives, styled with Tailwind CSS, using Framer Motion for animations and Shadcn/ui patterns.
**Key Design Decisions**:
- **Progressive Loading**: Server-Sent Events (SSE) for streaming.
- **Performance Optimization**: Memoization, virtualization (`react-virtual`), and code splitting.
- **Cache Strategy**: Multi-layer caching with configurable TTLs.
- **Offline Support**: PWA capabilities with service workers.
**Coaching Features**: Includes dashboards for academic goal tracking, multiple intelligence radar charts, learning style analysis, SMART goal creation, 360° evaluation visualization, achievement badges, daily self-assessment forms, and parent/home visit management.

## Backend Architecture

**Framework**: Express 5.1.0 with TypeScript on Node.js 22.
**Database**: SQLite with `better-sqlite3` for synchronous operations.
**Architecture Pattern**: Feature-based modular architecture, where each domain (e.g., coaching, students, surveys) is self-contained with its own repository, services, and routes.
**Key Design Decisions**:
- **Feature-Based Organization**: Code organized by domain.
- **Repository Pattern**: Separated data access layer.
- **Service Layer**: Encapsulated business logic.
- **Centralized Configuration**: Environment variables, CORS, and security settings.
**Security Measures**: CSRF protection (`csrf-csrf`), rate limiting (`express-rate-limit`), input validation (Zod), and cookie-based authentication with httpOnly cookies.
**Coaching Services**: Manages academic goals, multiple intelligence and learning style assessments, SMART goals, AI-powered recommendations, 360° evaluations, achievements, self-assessments, parent meetings, home visits, and family participation metrics.

## Data Storage Solutions

**Primary Database**: SQLite, stored in `./data/database.db`.
**Database Architecture**: Schema migrations via versioned SQL files; synchronous queries.
**Key Data Models**: `students`, `counseling_sessions`, `survey_templates`, `academic_records`, `risk_assessments`, `interventions`, `exam_sessions`, `guidance_categories`, `guidance_items`.
**Coaching System Tables**: `academic_goals`, `multiple_intelligence`, `learning_styles`, `smart_goals`, `coaching_recommendations`, `evaluations_360`, `achievements`, `self_assessments`, `parent_meetings`, `home_visits`, `family_participation`.
**Backup Strategy**: Manual and automatic backups with validation.

## Authentication and Authorization

**Authentication Method**: Cookie-based sessions with httpOnly cookies.
**User Roles**: `admin`, `counselor`, `teacher`, `observer`.
**Authorization Strategy**: Role-based permissions enforced on both frontend and backend; context-based authorization for React components.
**Security Features**: Password hashing (bcryptjs), CSRF token validation, rate limiting on auth endpoints, secure cookie settings.

# External Dependencies

## AI Services

-   **OpenAI Integration**: GPT-4 for advanced student analysis, intervention recommendations, and predictive analytics. Configurable via `OPENAI_API_KEY`.
-   **Google Gemini Integration**: Alternative AI provider for analysis and chat features. Configurable via `GEMINI_API_KEY`.
-   **Ollama (Local AI)**: Local LLM support for privacy-sensitive deployments or as a fallback. Configurable via `OLLAMA_BASE_URL`.
-   **AI Feature Usage**: Student risk prediction, automated action plans, survey sentiment analysis, multi-student comparative analysis, class-wide performance insights.

## Third-Party Services

-   **Email Notifications**: SMTP configuration for sending notifications.
-   **SMS Notifications**: Integration with Turkish SMS providers for parent communication.

## Key NPM Dependencies

**Frontend**: `react`, `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-virtual`, `react-hook-form`, `zod`, `recharts`, `react-big-calendar`, `react-markdown`, `date-fns`, `framer-motion`.
**Backend**: `express`, `better-sqlite3`, `bcryptjs`, `cookie-parser`, `cors`, `csrf-csrf`, `express-rate-limit`, `dotenv`, `multer`, `jspdf`, `xlsx`, `uuid`.
**Development**: `vite`, `typescript`, `tailwindcss`, `eslint`, `@vitejs/plugin-react-swc`.

## External APIs and Integrations

-   **Turkish Education System Compliance**: Adherence to MEB standards, tracking of Turkish standardized exams (LGS, TYT, AYT, YDT), and Turkish localization. Includes a hierarchical guidance standards system with an automated markdown-to-database pipeline.
-   **File Processing**: Excel import/export for bulk data, PDF generation for reports, and image upload.
-   **Progressive Web App**: Service worker for offline functionality, app manifest, and optional push notifications.

# Recent Changes

## November 18, 2024 - Default Subjects and Topics Data System
- ✅ Created `shared/data/default-subjects-topics.ts` with comprehensive default data for all subjects and topics
- ✅ Added automatic seeding system for subjects and topics database tables
- ✅ Implemented `seedSubjectsAndTopics()` function in `academic.schema.ts`
- ✅ Integrated seed function into database initialization process
- ✅ Default data includes:
  - **School (Lise)**: 13 subjects (no topics) - Matematik, Fizik, Kimya, Biyoloji, etc.
  - **LGS**: 6 subjects with 60+ topics - Türkçe, Matematik, Fen Bilimleri, etc.
  - **TYT**: 10 subjects with 80+ topics - Türkçe, Matematik, Geometri, Fizik, etc.
  - **AYT**: 14 subjects with 90+ topics - Matematik, Geometri, Fizik, Kimya, Edebiyat, etc.
  - **YDT**: 4 subjects with 50+ topics - İngilizce, Almanca, Fransızca, Arapça
- ✅ Each topic includes metadata: avgMinutes, energyLevel, difficultyScore, priority
- ✅ Database checks for existing data before seeding to avoid duplicates
- ✅ Automatic seeding runs on database initialization (first run only)

## November 18, 2024 - Subjects and Topics Reset Feature
- ✅ Added "Varsayılana Sıfırla" (Reset to Defaults) button to Courses page
- ✅ Implemented backend reset endpoint at `/api/subjects/reset`
- ✅ Created `resetToDefaultData()` function in subjects repository
- ✅ Reset functionality includes:
  - Deletes all existing subjects and topics from database
  - Re-seeds database with default MEB-compliant data
  - Wrapped in database transaction for data consistency
  - Rate-limited endpoint (10 requests per 15 minutes)
  - Requires authentication
- ✅ Frontend features:
  - AlertDialog confirmation before reset
  - Success/error toast notifications
  - Auto-refresh after reset to show updated data
  - Pattern consistent with guidance standards reset
- ✅ **Warning**: Reset removes all custom subjects and topics permanently

## November 18, 2024 - School Category Consistency Fix
- ✅ Fixed category inconsistency for School (Okul) subjects
- ✅ Updated type definitions to include 'School' category:
  - `StudySubject` type (client-side)
  - `Subject` interface (server-side)
- ✅ Fixed filtering logic to use consistent category values
- ✅ New subjects now save with `category: 'School'` instead of `undefined`
- ✅ Backward compatibility maintained:
  - Legacy subjects with `category: undefined` still display
  - New subjects use `category: 'School'` for consistency
  - Default data uses `category: 'School'`
- ✅ All exam categories now use consistent structure: School, LGS, TYT, AYT, YDT

## November 18, 2024 - Replit Environment Setup
- ✅ Imported GitHub project and extracted all files
- ✅ Installed Node.js 20 and all npm dependencies
- ✅ Created `.env` file from `.env.example` with default configuration
- ✅ Configured workflow to run `npm run dev` on port 5000
- ✅ Verified Vite configuration for Replit (0.0.0.0 host, allowedHosts: true, HMR via WSS)
- ✅ Confirmed Express backend integration and database initialization
- ✅ Configured autoscale deployment with build and start commands
- ✅ Application successfully running with all features initialized

### Replit-Specific Configuration
- Frontend: Vite dev server on 0.0.0.0:5000 with proxy support
- Backend: Express server integrated via Vite plugin
- Database: SQLite initialized at `./database.db`
- Admin account created automatically on first run
- All schedulers and background services running