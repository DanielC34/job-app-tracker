# ApplyFlow — Quick DB Reference

## Central Concepts

- **Hub:** `applications` → everything flows through this table  
- **Ownership:** `user_id` → every table ties to a user  
- **Versioning:** `resumes → resume_versions` → AI and edits always tie to a version  
- **Support:** notes & reminders → tracking & accountability, no AI  

---

## Table Quick Notes

### Users (`users`)
- Stores accounts  
- PK: `id`, Unique email  
- Owned by everyone else  

### Applications (`applications`)
- Each job tracked  
- PK: `id`  
- FK: `user_id` → owner, `resume_version_id` → resume used  
- Core workflow stages: `wishlist → applied → interview → offer → rejected`  
- Parent to notes, reminders, AI analyses, interview questions  

### Resumes (`resumes`) & Versions (`resume_versions`)
- `resumes` → base resume  
- `resume_versions` → individual uploads/AI-tailored versions  
- Always versioned; never overwrite  

### AI Analyses (`ai_analyses`)
- Insights per application + resume version  
- Types: `resume_review`, `job_match_score`, `interview_prep`, `followup_draft`  
- Tied to specific resume version used  

### Interview Questions (`interview_questions`)
- Generated per application (optional link to AI analysis)  
- Tracks category, tips, practiced status, user notes  

### Notes & Reminders
- `application_notes` → tracks status changes, observations  
- `follow_up_reminders` → simple reminders with due date & status  
- Both cascade delete with applications  

---

## Relationships (Key)

- `applications.user_id → users.id` (One-to-Many)  
- `applications.resume_version_id → resume_versions.id` (One-to-One)  
- `resume_versions.resume_id → resumes.id` (One-to-Many)  
- `ai_analyses.application_id → applications.id` (One-to-Many)  
- `interview_questions.application_id → applications.id` (One-to-Many)  
- `notes/reminders.application_id → applications.id` (One-to-Many)  

**Cascade rules:** deleting application removes notes, reminders, AI analyses, questions; resumes survive independently.  

---

## Quick Diagram Reading Tips

1. Identify **central hub** → `applications`  
2. Follow **ownership** → `user_id`  
3. Check **versioning** → `resumes → resume_versions`  
4. AI links → `ai_analyses` & `interview_questions`  
5. Support tables → notes & reminders  