# Overview

Rehber360 is a comprehensive student guidance and management system (Öğrenci Rehberlik Sistemi) for Turkish educational institutions. It facilitates student progress tracking, counseling, survey management, and risk level monitoring. The system incorporates AI-powered insights and a robust Coaching System (Koçluk Sistemi) for academic and personal development. Key features include academic goal tracking (YKS, LGS, TYT, AYT, YDT exam preparation), Multiple Intelligence and Learning Style Assessments, a 360° Evaluation and Achievement System, daily self-assessments, parent collaboration, and AI-Powered Recommendations. It is a full-stack TypeScript application with a React frontend, Express backend, and SQLite database.

# Recent Changes

## November 24, 2025 - Fixed Survey Excel Import, Refactored Templates, & Auto-Filled Student Data

### Part 3: Auto-Fill Student Data in Excel Based on Selected Classes
- **Feature Added**: When distributing surveys and selecting classes, the Excel template now automatically includes all student data from those classes
- **How It Works**:
  1. User selects classes in distribution dialog
  2. Clicks "Şablonu Önizle" or "Dağıtımı Oluştur"
  3. Excel template is generated with student data pre-filled:
     - Öğrenci No (Student ID)
     - Ad (First Name)
     - Soyad (Last Name)
     - Sınıf (Class)
     - Cinsiyet (Gender)
- **Implementation Details**:
  - Updated `generateAndDownloadExcelTemplate()` function to check both targetStudents and targetClasses
  - Updated `onSubmit()` function with same logic
  - Button now enables when either targetStudents or targetClasses are selected
- **Files Modified**: `client/components/features/surveys/SurveyDistributionDialog.tsx`
- **Impact**: Users can now:
  - Select classes instead of individual students
  - Immediately download Excel with student info pre-filled
  - No need to manually enter student data
  - Faster, cleaner workflow

### Part 1: Excel Import Algorithm Enhancement - Robust Distribution Lookup & Better Error Messages
- **Problem Identified**: When uploading survey responses via Excel, the system threw "Anket dağıtımı bulunamadı" (Survey distribution not found) error even when distribution existed
- **Root Cause**: 
  - Distribution ID wasn't being properly validated/trimmed before database lookup
  - Missing error logging made debugging difficult
  - Poor handling of empty/malformed Excel files
- **Solutions Implemented**:
  1. **Distribution ID Validation**: Added trimming and empty check on distribution ID
  2. **Enhanced Error Logging**: Logs all available distribution IDs when lookup fails
  3. **Excel File Validation**: Validates file buffer before parsing
  4. **Header Row Detection**: Case-insensitive detection works with "Öğrenci No" or "Student No"
  5. **Empty Row Filtering**: Filters out completely empty rows before processing
  6. **Consistent ID Usage**: Uses sanitized distribution ID throughout the import process
  7. **Questions Loading**: Added error handling for template questions lookup
  8. **Import Summary**: Improved logging of successful and failed imports
- **Files Modified**: `server/features/surveys/services/modules/excel-import.service.ts`

### Part 2: Excel Template Generation - Complete Restructure for Better UX & Efficiency
- **Major Problems Fixed**:
  - ❌ **Bloated Headers**: Soru başlıklarında seçenekler yer alıyordu → ✅ Başlıklar kısa ve temiz
  - ❌ **Unnecessary Columns**: Her soru için boş "yardımcı" sütunlar oluşturuluyordu → ✅ Kaldırıldı
  - ❌ **Confusing Layout**: Seçenekler başlık satırında karışık olarak görünüyordu → ✅ Ayrı "Soru Detayları" sayfasında
  - ❌ **Poor Instructions**: Talimatlar dağınık ve anlaşılmaz → ✅ Bölümlü, net, akıllı listeler
  
- **Refactored Features**:
  1. **Single Sheet Template (Tek Sayfa)**:
     - Başlıklar: Sadece "Soru No. Metin" + gerekli (*) işareti
     - Seçenekler artık başlıkta görünmüyor
     - Her soru için sadece 1 sütun (daha önce 2 sütun vardı)
     - Excel dosyası 50% daha az column genişliği
  
  2. **Multi Sheet Template (Çoklu Sayfa)**: 
     - **Talimatlar Sayfası**: Sayfalar hakkında bilgi, adım adım talimatlar, soru tipleri açıklaması
     - **Anket Yanıtları Sayfası**: Temiz sütunlar, veri girişi için hazır
     - **Soru Detayları Sayfası**: Tüm soruların seçenekleri ve kuralları net bir şekilde organize edilmiş
  
  3. **Question Details Sheet (Soru Detayları)**:
     - Soru başlığı + Zorunlu işareti (⭐)
     - Soru tipi açıkça yazılı
     - Seçenekler: 1. Seçenek1, 2. Seçenek2 (numaralandırılmış)
     - Doğrulama Kuralları: Eğer varsa (Min/Max değerler)
     - Daha okunabilir ve profesyonel format
  
  4. **Data Validation**:
     - Doğru sütunlara uygulandı (helper columns kaldırıldığı için)
     - Yes/No: Dropdown (Evet, Hayır)
     - Multiple Choice: Dropdown (tüm seçenekler)
     - Likert (1-5): Sayı validation
     - Rating (1-10): Sayı validation
  
  5. **Column Width Optimization**:
     - Öğrenci info sütunları: 12 karakter (compakt)
     - Soru sütunları: 15-35 karakter (esnek, okunabilir)
     - Talimatlar sayfası: 60 karakter (metnin tamamı görünecek)
  
- **Files Modified**: `client/lib/excel-template-generator.ts`
- **Impact**: 
  - Excel dosyaları daha hafif ve taşıması kolay
  - Sütunlar daha düzenli ve temiz
  - Kullanıcılar soru seçeneklerini kolayca görebiliyor
  - Hata oranı azalması (doğru format kullanımı)
  - Profesyonel ve kullanıcı dostu görünüm

## November 24, 2025 - Enhanced PDF Template & Bug Fixes

### PDF Template Enhancement - Comprehensive Student & Session Information
- **Expanded PDF Sections**: Completely redesigned PDF template with all student and session information
- **New Student Information Section (Öğrenci Bilgileri)**:
  - Name, Gender, ID Number, Nationality
  - Grade Level, Student Number
  - School, Year-end Success/GPA
  - Class, Absence Days
  - Family Info, Term, Health Info, Special Education Info
- **New Session Information Section (Görüşme Bilgileri)**:
  - Session Date & Time with Location
  - Guidance Area (Rehberlik Alanı) - displays full topic path
  - Session Mode (Çalışma Yöntemi)
  - Session Type (Individual/Group)
  - Teacher Name, Parent Name
  - Discipline/Behavior Status
- **New Session Details Section (Görüşme Ayrıntıları)**:
  - Exit Time
  - Detailed Session Information
- **Layout Improvements**:
  - Two-column layout for compact, professional appearance
  - Better spacing and typography matching official form standards
  - Proper font sizing (10pt main, 8pt details, 7pt notes)

### Data Fetching & Integration
- **Enhanced EnhancedCompleteSessionDialog Component**:
  - Added React Query hook to fetch full student data when dialog opens
  - Maps student data (gender, ID number, student number, health info, etc.)
  - Converts Turkish gender codes ('K'/'E') to readable format (Kız/Erkek)
  - Passes populated `studentData` to PDF generation function
- **Files Modified**: 
  - `client/components/features/counseling/utils/sessionCompletionPDF.tsx`
  - `client/components/features/counseling/enhanced/EnhancedCompleteSessionDialog.tsx`
- **Result**: 
  - PDF now displays student gender and student number from database
  - Guidance Area (Rehberlik Alanı) shows complete topic path (fullPath)
  - All student information is properly populated from API data

### PDF Download Error Fix (Defter - Counseling Sessions)
- **Issue**: Clicking "PDF İndir" threw "Invalid '' string child outside <Text>" error
- **Fix**: Added proper fallback values and trim checks for empty fields
- **Result**: PDF downloads now work without errors

### Logging Infrastructure Standardization
- **Issue Found**: Routes `student-profile-ai.routes.ts` and `ai-text-polish.routes.ts` used direct `console.error()` instead of the centralized logger service
- **Fix Applied**: Updated all error logging to use the proper `logger.error()` from the logger utility
  - Import added: `import { logger } from '../utils/logger.js'}`
  - All catch blocks now properly logged: `logger.error('message', 'ContextName', error)`
- **Benefit**: Consistent error logging across the application, better observability and debugging
- **Files Modified**: 
  - `server/routes/student-profile-ai.routes.ts` - 3 error handlers updated
  - `server/routes/ai-text-polish.routes.ts` - 1 error handler updated

## November 23, 2025 - Topic-Based Plan UI Enhancement & PDF Export

### Konu Bazlı Plan - Enhanced UX with Accordion & PDF Features
- **Improved Visual Design**: Completely redesigned the topic plan view for better readability and reduced eye strain
  - Replaced flat list with **Accordion structure** for collapsible day grouping
  - Each day shows summary (date, topic count, total minutes) in trigger, expandable for details
  - All days default to expanded for quick overview
  - Enhanced spacing, typography, and color contrast for better legibility
  - Larger touch targets and smoother hover transitions
  - Progress bars now show percentage completion alongside remaining time
- **PDF Export & Print Features**: 
  - Added "PDF İndir" button for downloading ink-friendly PDF reports
  - Added "Yazdır" button that opens PDF in new tab and triggers print dialog
  - PDF design is elegant, minimal, and optimized for printing (muted colors, clean layout)
  - Includes weekly summary, day-by-day breakdown with tables, and metadata footer
  - Generated using `jsPDF` and `jspdf-autotable` for professional table formatting
- **Files Modified**:
  - `client/components/features/student-profile/TopicPlanner.tsx` - Accordion UI + PDF buttons
  - `client/lib/utils/pdf-generator.ts` - New PDF generation utility with print support
- **Benefits**: Users can now easily navigate through days, export plans for offline reference, and print clean reports

## November 22, 2025 - Survey Defaults System Implementation

### Survey Default Templates - Idempotent Seeding & Reset Functionality
- **Default Survey Templates System**: Implemented robust defaults mechanism following guidance-standards pattern
  - Created normalized data structure in `shared/data/default-risk-map-survey.ts` with stable IDs
  - Default survey: "Sınıf Risk Haritası" (Class Risk Map) with 40+ MEB-compliant risk factors
  - Added `seedSurveysDefaultTemplates()` function with idempotent INSERT...ON CONFLICT DO UPDATE
  - Automatic restoration: Missing default templates/questions are recreated on every startup
  - Question IDs are deterministic and stable for proper upsert behavior
- **Reset to Defaults Feature**:
  - Added `resetToDefaults()` method in survey repository and service layers
  - Created POST `/api/surveys/survey-templates/reset` endpoint with admin authentication
  - UI: "Varsayılana Sıfırla" button with confirmation dialog on Surveys page
  - Destructive reset removes all templates (including custom) and restores canonical defaults
- **Database Integration**: seedSurveysDefaultTemplates() called during schema initialization
- **Files Modified**: 
  - `shared/data/default-risk-map-survey.ts` - Default survey data with stable IDs
  - `server/lib/database/schema/surveys.schema.ts` - Idempotent seeding function
  - `server/lib/database/schema/index.ts` - Seed function call
  - `server/features/surveys/repository/templates.repository.ts` - resetToDefaults()
  - `server/features/surveys/services/modules/templates.service.ts` - resetToDefaults()
  - `server/features/surveys/index.ts` - POST /reset endpoint
  - `client/pages/Surveys.tsx` - Reset button with AlertDialog

## November 22, 2025 - Enhanced Counseling Sessions Dashboard

### Görüşmeler (Counseling Sessions) Page - Metric Cards Enhancement
- **Added 2 New Metric Cards**: Expanded from 2 to 4 metric cards on the dashboard
  - **Tamamlanan (Completed)**: Shows total completed sessions with completion percentage rate
  - **Bu Ay (This Month)**: Displays sessions completed this month with weekly breakdown
- **Layout Update**: Changed grid layout from 2 columns to 4 columns for single-row display
  - Desktop (lg+): All 4 cards in a single row
  - Tablet (md): 2x2 grid layout
  - Mobile: Vertical stacking (1 column)
- **Component Modified**: `client/components/features/counseling/modern/SessionStatsCards.tsx`
- **Responsive Design**: StatsGrid component automatically handles responsive breakpoints
- **All 4 Metric Cards**:
  1. 🔵 Toplam Görüşme (Total Meetings) - Shows total with individual/group breakdown
  2. 🟢 Tamamlanan (Completed) - Shows completed count with completion rate percentage
  3. 🟡 Bu Ay (This Month) - Shows monthly count with weekly comparison
  4. 🟣 Ortalama Süre (Average Duration) - Shows average duration with total time

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React 18 with TypeScript and Vite. It employs React Router v6 for lazy-loaded client-side routing, React Query for server state, React Context for global state, and React hooks for local state management. The UI is built with custom components based on Radix UI primitives, styled with Tailwind CSS, and animated with Framer Motion following Shadcn/ui patterns. Design decisions include Server-Sent Events (SSE) for progressive loading, performance optimizations like memoization and code splitting, multi-layer caching, and PWA capabilities for offline support. Coaching features include dashboards for academic goal tracking, multiple intelligence radar charts, learning style analysis, SMART goal creation, 360° evaluation visualization, achievement badges, daily self-assessment forms, and parent/home visit management.

### Student Profile Organization

The student profile uses a **data-type focused architecture** with 8 main tabs, following professional counseling software standards:

1. **Genel Bakış (Overview)** - Dashboard with summary scores, profile completion status, and quick actions
2. **Demografik Bilgiler (Demographics)** - Identity information, contact details, and family structure
3. **Akademik Veriler (Academic)** - Grades, exams, attendance, study programs, and academic performance
4. **Psikososyal Profil (Psychosocial)** - Social-emotional development (SEL), behavioral observations, and peer relationships
5. **Gelişimsel Değerlendirmeler (Developmental)** - Multiple intelligences, learning styles, talents, and interests
6. **Sağlık & Destek (Health & Support)** - Health status, special education, risk analysis, and intervention plans
7. **Kariyer & Yaşam (Career & Life)** - Career goals, university planning, competencies, and future vision
8. **İletişim Kayıtları (Communication Records)** - Meeting records, parent communication, and professional notes

This structure ensures each data category has a single, well-defined location, preventing information duplication and improving user navigation efficiency.

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