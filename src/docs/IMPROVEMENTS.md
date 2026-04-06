# ApplyFlow Improvements Backlog

This document tracks planned enhancements and optimizations for the ApplyFlow platform, categorized by impact area.

## 1. Performance Improvements

### Add Caching for AI Responses
- **Description**: Implement a caching layer (e.g., Redis or a dedicated `ai_cache` table) to store and reuse responses for identical prompts (same resume + same JD).
- **Priority**: High
- **Reason**: Reduces redundant LLM API costs and significantly improves response times for repeated requests.

### Add Rate Limiting to all AI Edge Functions
- **Description**: Implement per-user rate limiting using Supabase Edge Runtime or a middleware service for all AI-invoking functions.
- **Priority**: High
- **Reason**: Protects against automated abuse, prevents unexpected cost spikes, and ensures fair usage across all users.

---

## 2. AI Enhancements

### Add AI Retry Mechanism for Failed Generations
- **Description**: Implement an exponential backoff retry logic in the Edge Functions or frontend service for transient AI provider errors.
- **Priority**: Medium
- **Reason**: Increases the robustness of the system during periods of high LLM latency or intermittent API failures.

### Add Deduplication Awareness to Follow-Up Generator
- **Description**: Before generating a new follow-up draft, check if a similar draft (same tone/context) already exists for the application.
- **Priority**: Medium
- **Reason**: Prevents cluttering the database with identical drafts and saves unnecessary AI compute.

---

## 3. UX Improvements

### Add Inline Editing for Follow-Up Drafts
- **Description**: Allow users to edit the AI-generated subject and body directly within the `FollowUpCard` before copying.
- **Priority**: High
- **Reason**: AI drafts are rarely 100% perfect; users need a quick way to personalize the text without switching apps.

### Highlight Latest Generated AI Output in UI
- **Description**: Automatically scroll to and visually highlight (e.g., with a subtle border animation) the most recent AI result.
- **Priority**: Medium
- **Reason**: Improves user focus and confirmation when many results are present on the same page.

### Introduce User Usage Analytics Dashboard
- **Description**: A dedicated view showing the user's weekly application activity, success rates, and AI credit usage (if applicable).
- **Priority**: Low
- **Reason**: Provides long-term value and motivation for job seekers to track their progress.

---

## 4. Security Enhancements

*Note: Rate limiting is also considered a core security enhancement.*

---

## 5. Technical Debt

### Improve Interview Questions UI to use `interview_questions` Table
- **Description**: Refactor the `ApplicationDetail` and `Interview` pages to fetch and update data from the structured `interview_questions` table instead of the `ai_analyses` JSON blob.
- **Priority**: High
- **Reason**: Necessary to support "Mark as Practiced" features and better data normalization introduced in v3.
