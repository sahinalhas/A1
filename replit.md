# Overview

Rehber360 is a comprehensive student guidance and management system designed for Turkish educational institutions. It aims to track student progress, provide counseling, manage surveys, and monitor risk levels. The system integrates AI-powered insights and a robust Coaching System for academic and personal development. Key capabilities include academic goal tracking for national exams (YKS, LGS, TYT, AYT, YDT), Multiple Intelligence and Learning Style Assessments, a 360° Evaluation and Achievement System, daily self-assessments, parent collaboration, and AI-Powered Recommendations. It is a full-stack TypeScript application.

# User Preferences

Preferred communication style: Simple, everyday language.
Coding standard: React Hook Form with Zod validation, ref-based form submission architecture for centralized management

# System Architecture

## Frontend Architecture

The frontend uses React 18 with TypeScript and Vite, employing React Router v6 for lazy-loaded client-side routing, React Query for server state, and React Context for global state. UI components are built with Radix UI primitives, styled with Tailwind CSS, and animated with Framer Motion, following Shadcn/ui patterns. Design principles include Server-Sent Events (SSE) for progressive loading, performance optimizations like memoization and code splitting, multi-layer caching, and PWA capabilities for offline support. Coaching features encompass dashboards for academic goal tracking, multiple intelligence radar charts, learning style analysis, SMART goal creation, 360° evaluation visualization, achievement badges, daily self-assessment forms, and parent/home visit management.

The student profile is organized with a **data-type focused architecture** across 8 main tabs, aligning with professional counseling software standards: Genel Bakış (Overview), Demografik Bilgiler (Demographics), Akademik Veriler (Academic), Psikososyal Profil (Psychosocial), Gelişimsel Değerlendirmeler (Developmental), Sağlık & Destek (Health & Support), Kariyer & Yaşam (Career & Life), and İletişim Kayıtları (Communication Records). This structure prevents information duplication and streamlines user navigation.

## Backend Architecture

The backend is built with Express 5.1.0 on Node.js 22, using TypeScript. It leverages SQLite with `better-sqlite3` for synchronous database operations. The architecture follows a feature-based modular pattern, organizing code by domain with dedicated repositories for data access, a service layer for business logic, and centralized configuration. Security measures include CSRF protection, rate limiting, Zod for input validation, and cookie-based authentication with httpOnly cookies. Coaching services manage academic goals, assessments, AI recommendations, evaluations, achievements, and parent/family interactions.

## Data Storage Solutions

The primary database is SQLite, located at `./data/database.db`. Schema migrations are managed via versioned SQL files. Key data models include `students`, `counseling_sessions`, `survey_templates`, `academic_records`, `risk_assessments`, `interventions`, `exam_sessions`, `guidance_categories`, `guidance_items`, and specific tables for the Coaching System such as `academic_goals`, `multiple_intelligence`, `learning_styles`, `smart_goals`, `coaching_recommendations`, `evaluations_360`, `achievements`, `self_assessments`, `parent_meetings`, `home_visits`, and `family_participation`. The system supports manual and automatic backups.

## Recent Changes (2025-11-27)

### Guidance Tips Feature - AI-Powered Professional Development
Implemented periodic informational balloon notifications for guidance counselors:

- **Database Schema**: `guidance_tips` and `guidance_tips_user_views` tables for tip storage and view tracking
- **AI Service**: Generates random educational tips using configured AI provider (OpenAI/Gemini/Ollama)
- **Fallback Mechanism**: 12 pre-defined Turkish professional tips ensure system works without AI connection
- **Scheduler**: Background service runs every 4 hours, maintains minimum 5 active tips
- **Frontend Component**: Animated balloon with Framer Motion, appears bottom-right every 30 seconds
- **Categories**: MEVZUAT (Legislation), TEKNIK (Technical), GORUSME (Counseling), VELI (Parent), OGRENCI (Student), ARAC (Tools), ETIK (Ethics), GENEL (General)
- **Files**: `server/features/guidance-tips/`, `client/components/features/guidance-tips/GuidanceTipBalloon.tsx`

## Previous Changes (2025-11-25)

### Hybrid Save Architecture - Auto-Save for Profiles, Manual for Settings
Implemented professional-grade form submission system with two complementary patterns for optimal UX:

#### Student Profile - Buttonless Auto-Save
- **useAutoSave Hook**: Created custom debounced auto-save system (2s debounce) with "Kaydediliyor..." → "✓ Kaydedildi" toast feedback
- **Form Watch + Debounce**: form.watch() triggers auto-save automatically on any field change (no manual save button)
- **Validation-First**: form.trigger() validates before submission, ensuring data integrity
- **Seamless Persistence**: All changes automatically persist to database via upsertStudent and section endpoints
- **Clean UI**: Removed bottom "Kaydedilmiş Değişiklikler" bar - users never worry about unsaved data
- **Pattern**: form.watch() → debouncedSave() → useAutoSave.triggerAutoSave() → validation → database

#### FormDirtyContext Simplification
- **Removed**: isDirty state tracking (no longer needed with auto-save)
- **Kept**: registerFormSubmit/unregisterFormSubmit callbacks for multi-section coordination (future extension)
- **Result**: 30+ lines of UI code removed, cleaner component structure

#### Auto-Save Implementation Details
- **Debounce Logic**: Prevents excessive API calls (2000ms wait after last change)
- **Toast System**: Uses sonner for "Saving..." → success/error feedback
- **Error Resilience**: Captures and displays save errors, prevents cascading failures
- **Cleanup**: Proper useEffect cleanup prevents memory leaks on component unmount

#### Settings Page (Manual Save - Unchanged)
- Keeps existing "Değişiklikleri Kaydet" button for sensitive settings
- Users maintain explicit control over settings changes
- SettingsTabDirtyContext ensures all tabs coordinate saves

#### Code Quality
- Removed redundant save handler registrations from UnifiedIdentitySection
- Eliminated manual save callbacks in favor of automatic watch-based saves
- Zero debugging code, production-ready implementation

## Authentication and Authorization

Authentication is cookie-based using httpOnly cookies, supporting user roles like `admin`, `counselor`, `teacher`, and `observer`. Authorization is role-based and enforced on both frontend and backend, with context-based authorization for React components. Security features include bcryptjs for password hashing, CSRF token validation, rate limiting on authentication endpoints, and secure cookie settings.

## UI/UX Design Decisions

The design adopts an "elegant, chic, minimal, compact" aesthetic with a refined color palette, subtle borders, and accessibility features such as 44px minimum touch targets and WCAG 2.2 compliant focus indicators. Typography uses a 15px base font size with lighter heading weights. Component designs are compact and minimal, featuring reduced padding, smaller border radii (0.875rem), and subtle visual effects.

# External Dependencies

## AI Services

-   **OpenAI Integration**: Utilizes GPT-4 for advanced student analysis, intervention recommendations, and predictive analytics.
-   **Google Gemini Integration**: Provides an alternative AI provider for analysis and chat features.
-   **Ollama (Local AI)**: Supports local LLM deployments for privacy or as a fallback.
-   **AI Feature Usage**: Powers student risk prediction, automated action plans, survey sentiment analysis, multi-student comparative analysis, and class-wide performance insights.

## Third-Party Services

-   **Email Notifications**: Configured for sending notifications via SMTP.
-   **SMS Notifications**: Integrated with Turkish SMS providers for parent communication.

## External APIs and Integrations

-   **Turkish Education System Compliance**: Adheres to MEB standards, tracks Turkish standardized exams (LGS, TYT, AYT, YDT), and includes Turkish localization. Features a hierarchical guidance standards system with an automated markdown-to-database pipeline.
-   **MEBBİS Integration**: Automated transfer of counseling session data to the official Turkish education system (MEBBİS) using Puppeteer-based browser automation. Features QR code authentication, real-time progress tracking via WebSocket, automatic retry for failed transfers, dynamic Chromium detection for Replit environment, and robust socket lifecycle management for sequential transfers.
-   **File Processing**: Supports Excel import/export, PDF generation for reports, and image uploads.
-   **Progressive Web App**: Includes a service worker for offline functionality, an app manifest, and optional push notifications.