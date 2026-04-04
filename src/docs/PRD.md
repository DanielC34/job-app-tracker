**ApplyFlow**

Product Requirements Document

Version 1.0 • 2026

AI-powered job application tracking, resume tailoring,

and interview preparation - all in one place.

_Confidential • Internal Use Only_

# **1\. Project Overview**

| **Field**     | **Details**                         |
| ------------- | ----------------------------------- |
| Project Name  | ApplyFlow                           |
| Version       | 1.0 - MVP                           |
| Document Type | Product Requirements Document (PRD) |
| Date          | 2026                                |
| Status        | Draft - Ready for Development       |
| Owner         | Product Team                        |

## **Description**

ApplyFlow is a web-based platform designed for active job seekers. It centralizes the entire job search workflow - from saving a job listing and uploading a tailored resume, to generating AI-powered interview questions and tracking application status - in a single, intuitive dashboard.

The core differentiator is deep AI integration: users can paste a job description and receive a tailored resume rewrite, a skills gap analysis, a match score, and a curated set of interview questions - all within seconds.

## **Target Users**

- Recent graduates and early-career professionals entering a competitive job market
- Mid-career professionals actively seeking a role change or promotion
- Freelancers and contractors managing multiple concurrent application pipelines
- Career changers who need help repositioning their existing skills for new industries

## **Goals & Objectives**

- Eliminate the chaos of tracking job applications across spreadsheets and browser tabs
- Reduce time spent tailoring resumes per application by 70%+ using AI assistance
- Increase interview conversion rates by surfacing relevant prep content automatically
- Provide a clear, motivating progress dashboard to keep job seekers engaged
- Reach 10,000 active users within 6 months of MVP launch

# **2\. Problem Statement**

Job searching is one of the most cognitively demanding and emotionally taxing activities a professional can undertake. Despite this, the tools available to job seekers remain fragmented, generic, and largely manual.

## **Core Problem**

Active job seekers apply to dozens - sometimes hundreds - of roles simultaneously. Without a centralized system, critical information is scattered: application statuses live in spreadsheets, tailored resumes sit in unlabeled folders, follow-up dates are forgotten, and interview prep is done ad-hoc from generic resources.

## **User Pain Points**

- Losing track of which version of a resume was sent to which company
- Forgetting to follow up after interviews, missing opportunities due to poor timing
- Spending 45-90 minutes tailoring a single resume for each job description
- Preparing for interviews without knowing what questions to actually expect
- No visibility into progress - how many applications are active, stalled, or won
- Resume rejection by Applicant Tracking Systems (ATS) due to keyword mismatches

## **The Cost of Inaction**

A disorganized job search directly reduces the candidate's chances of success. Missed follow-ups lose warm leads. Generic resumes fail ATS filters before a human ever reads them. Underprepared interviews result in offer rejections. ApplyFlow addresses all three failure points.

# **3\. Solution Overview**

ApplyFlow provides a single, unified workspace that combines application tracking, AI-powered resume tailoring, and intelligent interview preparation into a seamless workflow.

## **How ApplyFlow Solves the Problem**

| **Pain Point**              | **ApplyFlow Solution**                                     |
| --------------------------- | ---------------------------------------------------------- |
| Scattered application data  | Centralized tracker with stages, notes, reminders          |
| Resume version confusion    | Resume library linked to specific applications             |
| Generic resumes failing ATS | AI tailoring engine that rewrites for each job description |
| Unknown skill gaps          | Job Match Score + skills gap analysis                      |
| Underprepared interviews    | AI-generated interview questions per role and stage        |
| Missed follow-ups           | Follow-up reminder system with due dates                   |
| No visibility into progress | Real-time dashboard with KPIs and pipeline view            |

## **Core Value Proposition**

ApplyFlow turns a stressful, disorganized job search into a structured, AI-assisted process - giving candidates a measurable edge at every stage of the pipeline.

## **Key Differentiators**

- AI resume tailoring that rewrites bullet points to match each job description specifically
- Job Match Score that quantifies how well a resume aligns with a posting (0-100%)
- Interview question generator that uses both the job description and current application stage
- All-in-one: no need to switch between multiple tools for tracking, writing, and prepping

# **4\. User Personas**

## **Persona 1 - The Recent Graduate**

| **Attribute**    | **Detail**                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Name             | Amara, 23                                                           |
| Background       | BSc Computer Science, no full-time work experience                  |
| Goals            | Land a junior developer role within 3 months                        |
| Motivations      | Wants to look competitive despite limited experience                |
| Challenges       | Unsure how to tailor her resume; applies blindly to dozens of roles |
| Tech comfort     | High - uses web apps daily, expects modern UX                       |
| Key feature need | AI resume tailoring + interview prep for entry-level roles          |

## **Persona 2 - The Mid-Career Professional**

| **Attribute**    | **Detail**                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| Name             | David, 38                                                               |
| Background       | 8 years in marketing, seeking a Head of Growth role                     |
| Goals            | Secure a senior position with 20%+ salary increase                      |
| Motivations      | Tired of his current company; wants structured career advancement       |
| Challenges       | Has great experience but struggles to articulate it for different roles |
| Tech comfort     | Medium - comfortable with SaaS tools but not power user                 |
| Key feature need | Job Match Score + resume rewriting + application pipeline overview      |

## **Persona 3 - The Career Changer**

| **Attribute**    | **Detail**                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| Name             | Sofia, 31                                                              |
| Background       | Former teacher transitioning into UX Design                            |
| Goals            | Rebrand her resume to highlight transferable skills; get hired in tech |
| Motivations      | Passionate about design; currently completing an online bootcamp       |
| Challenges       | Existing resume is irrelevant; does not know how to reposition herself |
| Tech comfort     | Medium - uses Notion, Figma, online tools regularly                    |
| Key feature need | AI tailoring to reframe teaching experience + skills gap analysis      |

# **5\. User Flows**

## **Primary Flow: New User - First Application**

This is the happy path for a new user discovering the full feature set of ApplyFlow.

| **Step** | **Action**                                             | **Key Screen / Component** | **Notes**                                                  |
| -------- | ------------------------------------------------------ | -------------------------- | ---------------------------------------------------------- |
| 1        | User visits ApplyFlow and clicks Sign Up               | Landing page → Auth screen | Email + password; OAuth optional                           |
| 2        | Completes registration; redirected to dashboard        | Dashboard (empty state)    | Empty state encourages first action                        |
| 3        | Clicks 'Add Job' and fills in job details              | Application Form           | Company, role, stage, salary, job URL, description         |
| 4        | Application is saved; user lands on Application Detail | Application Detail page    | Central command for this job                               |
| 5        | Uploads a base resume PDF in the Resume tab            | Resume Library tab         | File upload to Supabase Storage                            |
| 6        | Triggers AI Resume Tailoring                           | Resume Review dialog       | AI rewrites resume for this specific job description       |
| 7        | Reviews AI suggestions; accepts or edits               | Resume diff view           | Side-by-side original vs. suggested                        |
| 8        | Clicks 'Generate Interview Questions'                  | Interview Prep tab         | AI generates role-specific and stage-appropriate questions |
| 9        | Reviews questions; adds personal notes                 | Interview Prep tab         | User can mark questions as practiced                       |
| 10       | Sets a follow-up reminder                              | Reminders tab              | Date picker + title; appears on dashboard                  |
| 11       | Updates application stage (e.g., Applied → Interview)  | Stage selector             | Kanban-style stage update                                  |
| 12       | Returns to dashboard for overall view                  | Dashboard                  | Stats update: total apps, pending reminders, match scores  |

## **Secondary Flow: Returning User - Daily Check-in**

- User logs in; lands on dashboard with live stats
- Reviews 'Urgent Follow-ups' widget - sees overdue reminders
- Clicks into an application to update stage or add a note
- Generates a follow-up email draft via the AI email generator
- Marks the reminder as done; dashboard updates

# **6\. Feature List - MVP**

The following features must be present for the MVP launch. All are required for the core user journey.

| **#** | **Feature**                | **Description**                                                                                | **Priority**     |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| 1     | User Authentication        | Email/password sign-up, login, logout, password reset via Supabase Auth                        | P0 - Must Have   |
| 2     | Application CRUD           | Create, read, update, delete job applications with all relevant fields                         | P0 - Must Have   |
| 3     | Application Stage Tracking | Move applications through predefined pipeline stages (Wishlist → Offer)                        | P0 - Must Have   |
| 4     | Resume Upload & Library    | Upload PDFs to Supabase Storage; link specific resume versions to applications                 | P0 - Must Have   |
| 5     | AI Resume Tailoring        | AI analyzes job description + resume and suggests rewrites for each bullet point               | P0 - Must Have   |
| 6     | Job Match Score            | AI compares resume to job description and returns a 0-100 compatibility score + missing skills | P0 - Must Have   |
| 7     | AI Interview Prep          | AI generates role-specific interview questions based on job description and stage              | P0 - Must Have   |
| 8     | Notes & Timeline           | Add typed notes (interview notes, status updates) with timestamps per application              | P1 - Should Have |
| 9     | Follow-up Reminders        | Create reminders with due dates linked to applications; surface on dashboard                   | P1 - Should Have |
| 10    | Dashboard Overview         | Stats panel: total applications, new this week, pending reminders, pipeline summary            | P0 - Must Have   |
| 11    | Application Detail Page    | Single-page command center for each job with tabs for resume, notes, prep, reminders           | P0 - Must Have   |

# **7\. Optional & Future Features**

| **Feature**                  | **Description**                                                                   | **Effort Estimate** |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| Job Description Scraper      | Paste a job URL and auto-populate company, role, and description fields           | Medium              |
| AI Follow-up Email Generator | Draft a follow-up email with customizable tone (formal, warm, urgent)             | Low                 |
| Interview Calendar View      | Calendar visualization of upcoming interview dates and deadlines                  | Medium              |
| Email / Push Notifications   | Notify users of overdue reminders via email or push notification                  | High                |
| ATS Score Predictor          | Simulate ATS parsing and predict whether a resume will pass keyword filters       | High                |
| Cover Letter Generator       | AI-generated cover letters tailored to each job description                       | Medium              |
| Global Search & Filters      | Search across all applications by company, salary range, location, or stage       | Medium              |
| Analytics & Insights         | Charts showing application success rates, average time-to-offer, stage conversion | High                |
| Browser Extension            | Add jobs directly from LinkedIn/Indeed without leaving the job board              | Very High           |
| Team / Referral Mode         | Allow a recruiter or career coach to view and comment on a job seeker's pipeline  | Very High           |
| Offer Comparison Tool        | Side-by-side comparison of multiple offers including salary, benefits, location   | Medium              |

# **8\. Functional Requirements**

## **8.1 Authentication**

**Inputs:** Email address, password (min 8 characters)

**Outputs:** Authenticated session token (JWT); user redirected to dashboard

**Actions:** Register, login, logout, request password reset

**Success Criteria:** User can register, log in, and access protected routes within 3 seconds

**Constraints:** All routes except landing page require authentication; sessions persist for 7 days

## **8.2 Application Management**

**Inputs:** Company name (required), role title (required), stage, salary range, job URL, job description, resume version

**Outputs:** Application record stored in DB; visible in list and detail views

**Actions:** Create, read, update, delete; stage changes logged automatically

**Success Criteria:** Application CRUD completes in under 1 second; stage changes reflected in dashboard immediately

**Constraints:** Users can only access their own applications (RLS enforced)

## **8.3 Resume Upload & Library**

**Inputs:** PDF file (max 10 MB), version label (e.g., 'Software Engineer v2')

**Outputs:** File stored in Supabase S3 bucket; record created in resume_versions table with file URL

**Actions:** Upload PDF, label version, link to application, delete version

**Success Criteria:** File uploads complete in under 5 seconds on a 10 Mbps connection

**Constraints:** Only PDF format accepted; max 10 MB per file; max 20 resumes per user

## **8.4 AI Resume Tailoring**

**Inputs:** resume_version.parsed_content (extracted PDF text), application.job_description

**Outputs:** JSON containing: strengths\[\], weaknesses\[\], rewritten_bullets\[\], suggestions\[\]

**Actions:** Trigger analysis; display side-by-side diff; accept or dismiss individual suggestions

**Success Criteria:** AI response returned in under 15 seconds; result persisted to ai_analyses table

**Constraints:** Requires parsed_content to be populated; fails gracefully if parsing failed

## **8.5 Job Match Score**

**Inputs:** resume_version.parsed_content, application.job_description

**Outputs:** JSON: score (0-100), matched_skills\[\], missing_skills\[\], recommendation_text

**Actions:** Trigger scoring; display score badge + skills gap list on Application Detail

**Success Criteria:** Score displayed within 15 seconds; updates stored in ai_analyses

**Constraints:** Requires both job description and resume content to be present

## **8.6 AI Interview Prep**

**Inputs:** application.job_description, application.current_stage, optional: application_notes

**Outputs:** JSON: questions\[\] grouped by type (behavioral, technical, situational), with difficulty tags

**Actions:** Generate questions; display in expandable list; mark individual questions as practiced

**Success Criteria:** Generates minimum 10 questions in under 15 seconds

**Constraints:** Question quality degrades if job_description is empty; UI warns user

## **8.7 Notes & Timeline**

**Inputs:** Note content (text), note type (Interview Notes, Status Update, General)

**Outputs:** Note stored in application_notes table; displayed in reverse chronological order

**Actions:** Add note, delete note, filter by type

**Success Criteria:** Note appears in timeline within 1 second of submission

**Constraints:** Notes are plain text only in MVP; no rich text formatting

## **8.8 Follow-up Reminders**

**Inputs:** Title, due date, application link

**Outputs:** Reminder record in follow_up_reminders table; displayed on dashboard if due within 7 days

**Actions:** Create reminder, mark as done, delete

**Success Criteria:** Overdue reminders are visually flagged in the dashboard; 'done' removes from view

**Constraints:** In MVP: UI-only; no email or push notifications

## **8.9 Dashboard**

**Inputs:** Authenticated user session

**Outputs:** Live stats: total applications, new this week, pending reminders, stage breakdown chart

**Actions:** Click through to individual applications from recent activity widget

**Success Criteria:** Dashboard loads in under 2 seconds; data is always current (no stale cache)

**Constraints:** Must handle empty state gracefully for new users with zero applications

# **9\. Non-Functional Requirements**

| **Category**    | **Requirement**                  | **Target**                                                                     |
| --------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| Performance     | Dashboard load time              | < 2 seconds on 10 Mbps connection                                              |
| Performance     | AI response time (all endpoints) | < 15 seconds; loading state shown immediately                                  |
| Performance     | Application CRUD operations      | < 1 second                                                                     |
| Scalability     | Concurrent users (MVP)           | Support 1,000 concurrent users without degradation                             |
| Scalability     | Database queries                 | All user-facing queries must use indexed columns                               |
| Security        | Authentication                   | JWT-based sessions via Supabase Auth; tokens expire in 7 days                  |
| Security        | Row Level Security (RLS)         | All DB tables enforce RLS - users can only access their own data               |
| Security        | API key exposure                 | AI API keys stored only in Supabase Edge Function environment variables        |
| Security        | File uploads                     | PDF files stored with private bucket policies; only accessible via signed URLs |
| Accessibility   | WCAG compliance                  | WCAG 2.1 AA - keyboard navigable, sufficient color contrast                    |
| Accessibility   | Screen reader support            | All interactive elements have ARIA labels                                      |
| Reliability     | Uptime (Supabase SLA)            | 99.9% uptime (Supabase hosted)                                                 |
| Reliability     | AI failure handling              | Graceful error messages if AI endpoint fails; retry option offered             |
| Browser support | Target browsers                  | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+                               |
| Mobile          | Responsive design                | Functional on screens >= 375px wide; key flows work on mobile                  |

# **10\. Database & Data Schema**

All tables are hosted in Supabase PostgreSQL. Every table includes created_at and updated_at timestamps. Row Level Security (RLS) policies ensure users can only access records where user_id matches their authenticated session.

## **Table: users (managed by Supabase Auth)**

| **Column** | **Type**    | **Notes**                                       |
| ---------- | ----------- | ----------------------------------------------- |
| id         | uuid PK     | Auto-generated; foreign key in all other tables |
| email      | text UNIQUE | Used for authentication                         |
| created_at | timestamptz | Auto-managed by Supabase                        |

## **Table: applications**

| **Column**        | **Type**      | **Notes**                                                          |
| ----------------- | ------------- | ------------------------------------------------------------------ |
| id                | uuid PK       | Auto-generated                                                     |
| user_id           | uuid FK       | References auth.users(id); RLS key                                 |
| company_name      | text NOT NULL |                                                                    |
| role_title        | text NOT NULL |                                                                    |
| current_stage     | enum          | wishlist \| applied \| screening \| interview \| offer \| rejected |
| job_url           | text          | Optional link to original job posting                              |
| salary_min        | integer       | Optional; stored in local currency unit                            |
| salary_max        | integer       | Optional                                                           |
| job_description   | text          | Full JD pasted by user; used as AI input                           |
| resume_version_id | uuid FK       | References resume_versions(id); nullable                           |
| created_at        | timestamptz   |                                                                    |
| updated_at        | timestamptz   |                                                                    |

## **Table: resume_versions**

| **Column**     | **Type**      | **Notes**                                 |
| -------------- | ------------- | ----------------------------------------- |
| id             | uuid PK       |                                           |
| user_id        | uuid FK       | RLS key                                   |
| label          | text NOT NULL | e.g., 'Software Engineer v3 - March 2026' |
| file_url       | text NOT NULL | Signed URL to Supabase Storage bucket     |
| parsed_content | text          | Extracted PDF text; used as AI input      |
| created_at     | timestamptz   |                                           |

## **Table: application_notes**

| **Column**     | **Type**      | **Notes**                                   |
| -------------- | ------------- | ------------------------------------------- |
| id             | uuid PK       |                                             |
| application_id | uuid FK       | References applications(id)                 |
| user_id        | uuid FK       | RLS key                                     |
| note_type      | enum          | interview_notes \| status_update \| general |
| content        | text NOT NULL | Plain text body                             |
| created_at     | timestamptz   |                                             |

## **Table: follow_up_reminders**

| **Column**     | **Type**      | **Notes**                   |
| -------------- | ------------- | --------------------------- |
| id             | uuid PK       |                             |
| application_id | uuid FK       | References applications(id) |
| user_id        | uuid FK       | RLS key                     |
| title          | text NOT NULL | Short reminder description  |
| due_date       | date NOT NULL |                             |
| status         | enum          | pending \| done             |
| created_at     | timestamptz   |                             |

## **Table: ai_analyses**

| **Column**     | **Type**       | **Notes**                                                       |
| -------------- | -------------- | --------------------------------------------------------------- |
| id             | uuid PK        |                                                                 |
| application_id | uuid FK        | References applications(id)                                     |
| resume_id      | uuid FK        | References resume_versions(id); nullable                        |
| user_id        | uuid FK        | RLS key                                                         |
| analysis_type  | enum           | resume_review \| job_match \| interview_prep \| follow_up_email |
| result_json    | jsonb NOT NULL | Full AI response stored as structured JSON                      |
| created_at     | timestamptz    |                                                                 |

# **11\. API & Integration Requirements**

## **Supabase Edge Functions (Internal API)**

| **Endpoint**         | **Method** | **Input**                       | **Output**                                    | **External Service** |
| -------------------- | ---------- | ------------------------------- | --------------------------------------------- | -------------------- |
| /resume-review       | POST       | parsed_content, job_description | strengths, weaknesses, rewritten_bullets      | Google Gemini        |
| /job-match-score     | POST       | parsed_content, job_description | score (0-100), matched_skills, missing_skills | Google Gemini        |
| /interview-prep      | POST       | job_description, current_stage  | questions\[\] grouped by type and difficulty  | Google Gemini        |
| /follow-up-generator | POST       | application_context, tone       | draft_email (subject + body)                  | Google Gemini        |

## **External Services**

| **Service**         | **Purpose**                                                | **Authentication**                          |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Supabase Auth       | User registration, login, JWT session management           | Supabase anon key + service role key        |
| Supabase PostgreSQL | Primary data store for all application data                | Supabase service role (server-side only)    |
| Supabase Storage    | PDF resume file storage with private bucket                | Signed URLs generated server-side           |
| Google Gemini API   | AI analysis for resume tailoring, matching, interview prep | API key stored in Edge Function environment |

## **Supabase Client (Frontend)**

- All database queries made via the Supabase JavaScript client from service files in src/lib/services/
- RLS policies enforce access control at the database level - never trust client-side filtering alone
- AI features are invoked via supabase.functions.invoke() to ensure API keys are never exposed client-side

# **12\. UI & Page Layout Overview**

| **Page / Screen**  | **Purpose**                                           | **Key Components**                                                                           |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Landing            | Marketing page for unauthenticated visitors           | Hero section, feature highlights, CTA to sign up                                             |
| Login / Register   | Authentication gate                                   | Email/password form, OAuth buttons, validation errors                                        |
| Dashboard          | Real-time overview of the job search                  | StatCards (total apps, new, reminders), recent apps list, urgent follow-ups widget           |
| Applications List  | Filterable, sortable list of all tracked applications | Search bar, stage filter chips, sortable table rows, quick stage update                      |
| Application Detail | Command center for a single job application           | Tabs: Overview, Resume, Interview Prep, Notes, Reminders; AI trigger buttons; stage selector |
| Resumes Library    | Manage all uploaded resume versions                   | Upload button, resume cards with labels, link-to-application button, delete                  |
| Application Form   | Create or edit a job application                      | Multi-section form: basics, salary, job description textarea, resume selector                |
| 404 / Error        | Handle navigation errors                              | Friendly error message, back-to-dashboard button                                             |

## **UI Design Principles**

- Minimal chrome: no sidebars cluttered with options; the primary nav has 4 items max
- AI features are surfaced contextually inside the Application Detail page - not in a separate tool
- All AI actions show a loading skeleton while the AI response streams in
- Empty states include a clear CTA so new users are never left stranded
- Color-coded stage badges make pipeline status scannable at a glance
- Mobile-first layouts for all core pages; complex tables collapse to card stacks on small screens

# **13\. Acceptance Criteria**

| **Feature**         | **Acceptance Criteria**                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| User Registration   | User can register with valid email and password; duplicate email shows clear error; redirected to dashboard on success                            |
| Login / Logout      | Valid credentials grant access within 3 seconds; invalid credentials show error without exposing which field failed; logout clears session        |
| Add Application     | Required fields (company, role) validated; application appears in list immediately; empty optional fields do not cause errors                     |
| Stage Update        | Stage change reflected in list and detail view within 1 second; stage change logged in notes timeline automatically                               |
| Resume Upload       | PDF up to 10 MB uploads successfully; non-PDF files are rejected with a clear error; uploaded file appears in resume library                      |
| AI Resume Tailoring | With valid resume content and job description, analysis returns within 15 seconds; user can accept, dismiss, or edit each suggestion individually |
| Job Match Score     | Score between 0-100 displayed; matched and missing skills listed; result persisted and visible on subsequent page loads                           |
| Interview Prep      | Minimum 10 questions generated; questions are grouped by type; user can mark individual questions as practiced                                    |
| Notes Timeline      | Note appears in timeline immediately after submission; notes display in reverse chronological order; delete removes immediately                   |
| Follow-up Reminders | Reminder with future date created successfully; overdue reminders appear flagged in dashboard; marking done removes from active view              |
| Dashboard Stats     | Stats reflect current data without requiring manual refresh; empty state shown correctly for new users                                            |
| RLS Enforcement     | User A cannot access, view, or modify User B's data under any authenticated request                                                               |

# **14\. Prioritization**

| **Priority**      | **Feature**                  | **Rationale**                               |
| ----------------- | ---------------------------- | ------------------------------------------- |
| P0 - Must Have    | User Authentication          | Nothing works without auth                  |
| P0 - Must Have    | Application CRUD             | Core tracker functionality                  |
| P0 - Must Have    | Application Stage Tracking   | Central to the tracker value prop           |
| P0 - Must Have    | Dashboard                    | Entry point; shows value immediately        |
| P0 - Must Have    | Application Detail Page      | Command center for all other features       |
| P0 - Must Have    | AI Resume Tailoring          | Primary AI differentiator                   |
| P0 - Must Have    | Job Match Score              | Second AI differentiator; drives engagement |
| P0 - Must Have    | AI Interview Prep            | Third AI differentiator; high user value    |
| P1 - Should Have  | Resume Upload & Library      | Required for AI features to work well       |
| P1 - Should Have  | Notes & Timeline             | Important for context during interviews     |
| P1 - Should Have  | Follow-up Reminders          | High practical value; simple to build       |
| P2 - Nice to Have | AI Follow-up Email Generator | Adds polish; low effort                     |
| P2 - Nice to Have | Job Description Scraper      | Reduces friction; medium effort             |
| P3 - Future       | Email / Push Notifications   | High effort; requires infrastructure        |
| P3 - Future       | ATS Score Predictor          | High value but complex; post-MVP            |
| P3 - Future       | Browser Extension            | High value, very high effort                |

# **15\. Success Metrics**

| **Metric**                    | **Target (6 months post-launch)**                | **How Measured**                               |
| ----------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Monthly Active Users (MAU)    | 10,000+                                          | Supabase Auth logins per month                 |
| Applications tracked per user | \> 8 per active user                             | DB query: avg(applications) per user_id        |
| AI analyses triggered         | \> 3 per user per session                        | ai_analyses table event count                  |
| AI suggestion acceptance rate | \> 50% of suggestions accepted                   | Accepted vs dismissed in UI interaction log    |
| Session duration              | \> 8 minutes average                             | Frontend analytics (e.g., PostHog)             |
| D7 retention                  | \> 40% of registered users return after 7 days   | Cohort analysis in analytics platform          |
| Interview prep engagement     | \> 60% of users with interviews use prep feature | Interview stage + interview_prep analysis rate |
| Reminder completion rate      | \> 70% of created reminders marked done          | follow_up_reminders status ratio               |
| NPS Score                     | \> 40                                            | In-app survey after 14 days of use             |
| Support ticket volume         | < 5% of MAU submit a bug report                  | Support platform (e.g., Intercom)              |

# **16\. Constraints & Assumptions**

## **Constraints**

- The MVP tech stack is fixed: React 18 + Vite, Supabase (Auth, DB, Storage, Edge Functions), Google Gemini API
- AI features require an active internet connection and are unavailable offline
- PDF text extraction quality directly affects AI output quality; scanned PDFs with no embedded text will produce poor results
- No native mobile app in MVP; responsive web only
- Supabase free/pro tier limits apply; Edge Function cold starts may add 1-3 seconds to first AI call
- Gemini API rate limits apply; concurrent AI requests per user may need throttling

## **Assumptions**

- Users are comfortable writing their own job descriptions into the app (copy-paste from job boards)
- Users have an existing resume in PDF format that they can upload
- The primary user device is a laptop or desktop browser, not a mobile phone
- English is the primary language for MVP; internationalization (i18n) is out of scope
- Supabase provides sufficient scaling for 10,000 MAU without architectural changes
- Users understand that AI suggestions are recommendations, not guarantees of interview success
- GDPR and CCPA compliance will be addressed before public launch via Supabase's data handling policies