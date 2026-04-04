# ApplyFlow v3 — ERD + User Flow Hybrid Explanation

This document explains the ApplyFlow v3 **entity-relationship diagram (ERD)** alongside the **core user flow loop**. It is designed to help developers immediately understand how data, AI, and user actions interact.

---

## 1. Core Philosophy

ApplyFlow revolves around a **single repeatable loop**:

> Capture Job → Attach Resume → Analyze → Prepare → Track → Iterate

The ERD reflects this by centering on **applications** as the hub connecting users, resumes, AI analyses, interview prep, notes, and reminders.

---

## 2. ERD Breakdown

### Users Table (`users`)
- **Purpose:** Stores every user of ApplyFlow.
- **Key Fields:** `id`, `email`, `created_at`
- **Relationships:**  
  - Owns applications, resumes, notes, reminders, AI analyses.

---

### Applications Table (`applications`)
- **Purpose:** Represents each job the user tracks.
- **Key Fields:**  
  `id`, `user_id`, `company_name`, `role_title`, `location`, `salary_min/max`, `currency`, `job_url`, `job_description`, `current_stage`, `resume_version_id`
- **Relationships:**  
  - Linked to `users` via `user_id`.  
  - Linked to `resume_versions` via `resume_version_id`.  
  - Parent of `ai_analyses`, `interview_questions`, `application_notes`, and `follow_up_reminders`.

---

### Resumes & Versions
#### Resumes (`resumes`)
- **Purpose:** Groups related resumes under a parent title.
- **Key Fields:** `id`, `user_id`, `title`
- **Relationship:** Parent of multiple `resume_versions`.

#### Resume Versions (`resume_versions`)
- **Purpose:** Tracks individual uploads or tailored edits.
- **Key Fields:** `id`, `resume_id`, `file_url`, `parsed_content`, `created_at`
- **Rules:**  
  - Version history is mandatory.  
  - AI analyses always tie to a specific `resume_version`.

---

### AI Analyses (`ai_analyses`)
- **Purpose:** Stores AI insights (resume reviews, match scores, interview prep, follow-up drafts).
- **Key Fields:** `id`, `user_id`, `application_id`, `resume_version_id`, `analysis_type`, `result_json`
- **Relationships:**  
  - Tied to both the application and the specific resume version used.  
- **Notes:**  
  - Deleting an application cascades to its AI analyses.

---

### Interview Questions (`interview_questions`)
- **Purpose:** Tracks AI-generated questions for interview prep.
- **Key Fields:** `id`, `application_id`, `ai_analysis_id`, `question_text`, `category`, `tips`, `is_practiced`, `user_notes`
- **Rules:**  
  - Questions belong to a single application.  
  - Practice status and notes are per-question, per-user.

---

### Notes & Reminders
#### Application Notes (`application_notes`)
- Tracks status changes, general notes, and follow-ups.
- `metadata` JSONB stores structured info (like stage changes).

#### Follow-Up Reminders (`follow_up_reminders`)
- Tracks actionable reminders per application (`title`, `due_date`, `status`).

---

## 3. Relationships Summary

| From | To | Relationship | Notes |
|------|----|--------------|-------|
| `applications.user_id` → `users.id` | One-to-Many | Each user can have multiple applications |
| `applications.resume_version_id` → `resume_versions.id` | One-to-One | Resume used for this application |
| `resume_versions.resume_id` → `resumes.id` | One-to-Many | Versions grouped under parent resume |
| `ai_analyses.application_id` → `applications.id` | One-to-Many | Multiple AI insights per application |
| `ai_analyses.resume_version_id` → `resume_versions.id` | One-to-One | Links analysis to exact resume version |
| `interview_questions.application_id` → `applications.id` | One-to-Many | Questions belong to an application |
| `application_notes.application_id` → `applications.id` | One-to-Many | Tracks notes and stage changes |
| `follow_up_reminders.application_id` → `applications.id` | One-to-Many | Tracks reminders per application |

**Cascade Rules:**
- Deleting an application removes notes, reminders, AI analyses, and interview questions.
- Resume versions do not delete the parent resume or other versions.

---

## 4. How ERD Maps to User Flow

1. **Capture Job → `applications`**  
   - Job creation writes directly to `applications`.

2. **Attach Resume → `resumes` + `resume_versions`**  
   - Each job links to one resume version.  
   - All versions grouped under a parent `resume`.

3. **Analyze → `ai_analyses`**  
   - AI consumes `resume_version` + `job_description`.  
   - Results saved in structured JSON for actionable insights.

4. **Prepare → `interview_questions`**  
   - AI generates questions linked to the application and optionally to the analysis.

5. **Track → `application_notes` + `follow_up_reminders`**  
   - Status changes, personal notes, and follow-up tasks logged here.

6. **Iterate → Repeat Loop**  
   - Users can update resumes, rerun analyses, generate new interview prep, and continue tracking.

---

## 5. Quick-Read Strategy

1. **Start from `applications`** → Everything flows through it.  
2. **Look for ownership (`user_id`)** → Determines access control.  
3. **Check versioning (`resumes → resume_versions`)** → AI always works with a specific version.  
4. **AI & Prep (`ai_analyses` + `interview_questions`)** → Connected to both resume and application.  
5. **Support Tables (`notes` + `reminders`)** → Track auxiliary data and actions.

---

**Conclusion:**  
The ERD is fully aligned with the **v3 user flow**. Each table and relationship supports **the core loop: Capture → Analyze → Prepare → Track → Iterate**, while ensuring **versioning, AI traceability, and structured user actions**.
