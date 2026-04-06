# ApplyFlow System Architecture – Explanation

## Overview
The ApplyFlow architecture follows a modern full-stack pattern using:
- React (Frontend)
- Supabase (Backend-as-a-Service)
- Edge Functions (Serverless Logic)
- Gemini AI (External Intelligence Layer)

The system is designed with clear separation of concerns:
- UI (presentation)
- Services (data orchestration)
- Backend (data + security)
- AI (processing + insights)

---

## 1. Frontend Layer (React + TypeScript)

### Purpose
Handles all user interaction and UI rendering.

### Key Parts
- Pages: ApplicationsList, ApplicationDetail, Resumes
- Components: Interview Questions UI, Notes, Reminders
- State Management: Zustand (or similar)
- Service Layer: Centralized API logic (e.g. `ai.service.ts`, `applications.service.ts`)

### How It Works
User actions (clicks, form inputs) trigger service calls instead of directly calling the backend. This keeps UI clean and maintainable.

---

## 2. Service Layer (Critical Middle Layer)

### Purpose
Acts as the bridge between frontend and backend.

### Responsibilities
- Calling Supabase client
- Calling Edge Functions
- Handling responses
- Normalizing data for UI

### Why It Matters
Prevents business logic from leaking into UI components and ensures consistent data handling.

---

## 3. Backend Layer (Supabase)

### Database (PostgreSQL)

#### Core Tables
- `applications` → Tracks job applications
- `resumes` → Parent resume entity
- `resume_versions` → Specific resume versions
- `ai_analyses` → AI job match results
- `interview_questions` → Structured interview prep
- `notes` → User notes
- `reminders` → Follow-up tracking

### Row Level Security (RLS)

#### Purpose
Ensures users can only access their own data.

#### Mechanism
- `USING` → Controls read access
- `WITH CHECK` → Controls write access

This is enforced at the database level, not the frontend.

---

## 4. Edge Functions (Serverless Backend Logic)

### Functions
- `job-match-score`
- `interview-prep`
- `follow-up-generator` (partial)

### Purpose
Handles:
- AI requests
- Data validation
- Controlled database writes

### Flow
Frontend → Edge Function → Gemini API → Response → Database

### Key Design Choice
All AI logic is centralized here instead of frontend for:
- Security
- Validation
- Control

---

## 5. AI Layer (Gemini API)

### Purpose
Provides intelligent analysis.

### Outputs
- Match scores
- Skills analysis
- Interview questions
- (Future) Follow-up emails

### Important Constraint
AI responses must be:
- Structured (JSON)
- Validated strictly
- Rejected if malformed

This prevents corrupt data entering the system.

---

## 6. Storage Layer

### Supabase Storage
- Stores uploaded resumes
- Linked to `resume_versions`

---

## 7. Data Flow (End-to-End)

### Standard Flow
1. User interacts with UI
2. UI calls service layer
3. Service calls:
   - Supabase DB (CRUD)
   - Edge Functions (AI)
4. Edge Function calls Gemini
5. Gemini returns structured response
6. Data is validated
7. Data stored in DB
8. UI fetches and displays results

---

## 8. Key Architectural Strengths

- Clear separation of concerns
- Strong data integrity (transactions + constraints)
- Secure by design (RLS)
- AI safely integrated (validated + controlled)
- Scalable structure (modular services + functions)

---

## 9. Failure Points & Safeguards

### Possible Failures
- AI returns invalid JSON
- DB insert fails
- Network issues

### Safeguards
- Hard error throwing in Edge Functions
- Transactional DB operations
- Strict validation before insert

---

## Summary

ApplyFlow is built as a **modular, AI-enhanced SaaS system** where:
- The frontend handles experience
- The backend enforces rules
- The AI provides intelligence
- The system ensures data integrity at every step