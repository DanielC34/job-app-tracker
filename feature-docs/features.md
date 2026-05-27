# Applyflow Features Documentation

This document explains the major features of the Applyflow application in simple, human-readable terms.

---

## 1. Job Application Tracking (CRUD system)

### What it does
This feature is the core of Applyflow. It allows users to keep track of the jobs they have applied for. It exists so that job seekers don't lose track of who they contacted, when they applied, and what stage of the interview process they are currently in. 

### How it works (simple flow)
1. User opens the dashboard.
2. User clicks a button to add a new job application.
3. User fills out a form with details (e.g., company name, role, application date).
4. System saves this information to the database.
5. User sees their new application appear in a list or board on their screen.
6. User can later click on the application to edit the details or delete it if no longer needed.

### What technologies are involved
- React (for the user interface and forms)
- Supabase (for the database that stores the applications)

### Key learning / takeaway
In this feature implementation, I learned the fundamentals of connecting a frontend form to a backend database to Create, Read, Update, and Delete (CRUD) records.

---

## 2. Job Match Analysis

### What it does
This feature compares a user's resume against a specific job description to tell them how good of a match they are. It exists to help users figure out if they have the right skills for a job before they spend time applying.

### How it works (simple flow)
1. User pastes their resume text into a text box.
2. User pastes the job description into another text box.
3. User clicks the "Analyze Resume" button.
4. System sends both texts securely to the backend.
5. The backend uses AI to score the match and find strengths and weaknesses.
6. System receives the response and the user sees their match score and feedback appear on the screen.

### What technologies are involved
- React (for the text boxes and showing the result)
- Supabase Edge Functions (to securely process the request)
- AI API (to analyze the texts and generate the score)

### Key learning / takeaway
In this feature implementation, I learned how to take user input, send it to a secure backend function, and use an AI model to return structured data to the screen.

---

## 3. Follow-up Email Generator

### What it does
This feature writes a personalized follow-up email for a specific job application. It exists because writing follow-up emails after an interview or application can be stressful and time-consuming.

### How it works (simple flow)
1. User selects a job application they want to follow up on.
2. User clicks a button to generate an email.
3. System gathers the details of that application (like the company name and role).
4. System sends these details to the backend.
5. The backend asks the AI to write a professional email based on those details.
6. System receives the email text, and the user sees it on their screen ready to copy and send.

### What technologies are involved
- React (for the button and displaying the generated email)
- Supabase Edge Functions (to securely talk to the AI)
- AI API (to write the actual email text)

### Key learning / takeaway
In this feature implementation, I learned how to use existing database records as context for an AI prompt to generate useful, personalized content.

---

## 4. Resume Review

### What it does
This feature acts like an automated career coach, reading a user's resume and giving them feedback on how to improve it. It exists to help users fix mistakes and make their resumes more appealing to recruiters.

### How it works (simple flow)
1. User selects their saved resume.
2. User clicks the "Review Resume" button.
3. System sends the resume content to the backend.
4. The backend asks the AI to read the resume and suggest improvements.
5. System receives the feedback.
6. User sees a list of strengths, weaknesses, and suggested rewrites on their screen.

### What technologies are involved
- React (for the interface)
- Supabase Edge Functions (for the secure backend logic)
- AI API (for understanding the resume and providing feedback)

### Key learning / takeaway
In this feature implementation, I learned how AI can be used to parse unstructured text (like a resume) and return actionable, structured advice back to the user interface.
