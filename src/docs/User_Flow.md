# ApplyFlow — Core User Flow (v3: Schema-Aligned & Implementation-Ready)

This document defines the **exact, deterministic user flow** of ApplyFlow, fully aligned with the current database schema.

Purpose:

* Remove ambiguity for AI agents and developers
* Ensure consistency across all features
* Prevent feature drift and guesswork

---

# 0. Core Philosophy

ApplyFlow is built around a **single repeatable loop**:

> Capture Job → Attach Resume → Analyze → Prepare → Track → Iterate

Non-negotiables:

* No hidden steps
* No optional branching without explicit triggers
* Every action must produce visible user value
* Every action must persist state in the database tables (`applications`, `resumes`, `resume_versions`, `ai_analyses`, `application_notes`, `follow_up_reminders`, `interview_questions`)

---

# 1. Entry & Authentication

## Goal

Securely authenticate users and load their workspace.

## Flow

1. User opens application.
2. System checks for active session.

### If session exists:

3. Fetch user data:

   * Applications (`applications`)
   * Resumes (`resumes` + `resume_versions`)
   * Notes (`application_notes`)
   * Reminders (`follow_up_reminders`)
   * AI analyses (`ai_analyses`)
   * Interview questions (`interview_questions`)
4. Redirect → **Dashboard**

### If no session:

5. Show **Auth Screen**: Login / Sign Up
6. User submits credentials

### Success:

7. Create session
8. Fetch all user data
9. Redirect → **Dashboard**

### Failure:

10. Show clear error
11. Offer retry / reset password

---

# 2. Dashboard (Control Center)

## Goal

Provide **immediate clarity + next actions**.

## Data Loaded

* Applications (all stages)
* Stage distribution
* Latest AI insights per application
* Upcoming reminders

## User Actions

1. View application cards
2. Filter/sort by Stage, Date, Match Score, Resume Version
3. Click application → **Application Detail**
4. Click **Add Job** → start new flow

## Rules

* Dashboard MUST answer: *“What should I do next?”*
* No dead UI elements

---

# 3. Add Job (Creation Step)

## Goal

Create a structured application record in `applications`.

## Flow

1. User clicks **Add Job**
2. Input mode: URL or Manual Entry

### URL Input

3. Paste job URL
4. System scrapes company, role, description → populate form

### Manual Entry

5. Fill in: Company, Role, Location, Salary, Employment Type, Work Mode, Description

### Finalization

6. Review fields
7. Click **Save** → insert record into `applications` with default stage = `Wishlist`
8. Redirect → **Application Detail**

## Rules

* Job creation must take < 60 seconds
* No AI calls at this stage

---

# 4. Application Detail (Core Workspace)

## Goal

Central hub for a single job application.

## Sections

* Job Info
* Resume Attachment / Versions
* AI Analyses (`ai_analyses`)
* Interview Prep (`interview_questions`)
* Notes (`application_notes`)
* Timeline / Follow-ups (`follow_up_reminders`)

## Entry

From Dashboard or Job creation

---

# 5. Resume Attachment & Versioning

## Goal

Provide structured resume input for AI processing.

## Flow

1. User clicks **Attach Resume**
2. Choose Upload New / Select Existing (`resume_versions`)

### Upload

3. Upload PDF → store in Supabase Storage
4. Parse text → store in `resume_versions.parsed_content`
5. Link resume to application (`applications.resume_version_id`)
6. Display preview + label

### Existing

7. Select resume version
8. Link to application

## Rules

* Parsing must succeed or show explicit failure
* Version history mandatory (grouped under `resumes` parent table)

---

# 6. Resume Analysis (AI Step)

## Goal

Generate actionable improvement insights stored in `ai_analyses`.

## Preconditions

* Job description exists
* Resume attached

## Flow

1. User clicks **Analyze Resume**
2. System sends: Resume text + Job description to AI
3. AI returns: Match score, Missing keywords, Suggestions
4. Store result in `ai_analyses` (application_id, resume_id, result_json)

## Output

* Score (prominent)
* Gaps / missing skills
* Suggestions

## User Actions

* Save analysis
* Copy suggestions
* Trigger re-analysis after edits

## Rules

* Output structured, actionable
* No vague advice

---

# 7. Resume Tailoring (Optional)

## Goal

Generate a new resume version with AI suggestions

## Flow

1. Click **Tailor Resume**
2. System applies AI suggestions → generate new version
3. Save as new `resume_versions` entry under parent `resumes`

## Rules

* Never overwrite original
* Version history required
* Allow PDF download

---

# 8. Interview Preparation

## Goal

Prepare job-specific interview questions

## Flow

1. Click **Generate Interview Prep**
2. System sends job description + resume to AI
3. AI returns technical + behavioral questions
4. Store in `interview_questions` table

## User Actions

* Mark practiced (`is_practiced` boolean)
* Add notes (`user_notes`)
* Export / copy

## Rules

* Questions must be job-specific
* Avoid generic outputs

---

# 9. Application Tracking & Follow-ups

## Goal

Track progress and actions

## Flow

1. Update stage (`applications.current_stage`)
2. Add notes (`application_notes`)
3. Add reminders (`follow_up_reminders`)
4. System persists changes and updates Dashboard metrics

## Rules

* Stage updates instant
* No confirmation friction

---

# 10. Feedback Loop (Retention Mechanism)

* Review application
* Improve resume
* Prepare interview
* Update status
* Repeat

System must continuously surface next best action.

---

# 11. Hard Constraints

1. No feature may bypass core loop
2. No AI call without required inputs
3. No hidden state changes
4. One primary action per screen
5. Every action updates visible state and persists to database

---

# 12. Definition of Done

* Complete flow from Job Discovery → Resume Tailoring → Interview Prep → Application Tracking
* No step requires external tools
* Each step provides immediate value

---

# Summary

ApplyFlow is a **precision-guided system for job applications**. Features exist only to enhance clarity, speed, or success rate, fully backed by the database schema for reliability.
