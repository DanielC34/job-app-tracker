# ApplyFlow User Flow Explanation

This document provides a detailed walkthrough of the **ApplyFlow** user flow, explaining how the user interacts with the system and how the system responds internally.

---

## 🧭 Understanding the Diagram

- **Rectangles** → Actions (user/system steps)  
- **Diamonds** → Decisions (branching logic)  
- **Arrows** → Direction of flow  
- **Start/End nodes** → Entry and exit points  

Flow is generally read **top → down** or **left → right**.

---

## 1. Entry Point

**Flow:**  
`User → Login → Dashboard / Applications List`

- User authenticates (Supabase Auth)
- Lands on their **main control center**  
- All actions start from here

---

## 2. Create Application Flow

**Flow:**  
`Click "Add Application" → Enter job details → Select/upload resume → Save`

- Form data is collected and stored in the `applications` table
- Resume version is linked
- This is the **foundation of all AI features**

---

## 3. AI Job Match Flow

**Flow:**  
`Click "Analyze Match" → Edge Function → AI processes → Results returned`

**Output:**  
- Match score (0–100)  
- Matched skills vs Missing skills

**Decision Node:**  
- ✅ Success → Show results  
- ❌ Failure → Show error  

Purpose: Helps user determine **fit for a job**.

---

## 4. Interview Prep Flow

**Flow:**  
`Click "Generate Questions" → Edge Function → AI generates questions → Stored in DB → Displayed to user`

- Users can mark questions as “Practiced”  
- Add personal notes  
- **Interactive feature**: turns AI output into actionable practice items

---

## 5. Follow-Up Flow

**Flow:**  
`Click "Generate Follow-up" → Edge Function → (Future: AI generates email)`

- Currently partially implemented  
- Intended to draft "Thank You" or "Checking In" emails  

---

## 6. Notes & Reminders Flow

**Flow:**  
`Add Note → Saved → Displayed in timeline`  
`Set Reminder → Stored → Tracked`

- Keeps track of interviews, follow-ups, and other interactions  
- Supports user productivity and organization

---

## 7. Status Update Flow

**Flow:**  
`Wishlist → Applied → Interview → Offer / Rejected`

- User manually updates status  
- System tracks progression  
- Gives structure to the job search process

---

## 🔀 Decision Points (Critical Logic)

1. **AI Success vs Failure**  
   - Valid → continue  
   - Invalid → stop and show error  

2. **Missing Resume**  
   - Prevents AI actions until a resume is uploaded  

3. **Invalid Input**  
   - Stops flow until required fields are completed  

---

## 🔁 Full End-to-End Journey

```text
User logs in
↓
Creates application
↓
Attaches resume
↓
Runs AI match
↓
Reviews insights
↓
Generates interview questions
↓
Practices + tracks progress
↓
Adds notes/reminders
↓
Updates status
↓
(Future) Sends follow-up email