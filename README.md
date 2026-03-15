# ApplyFlow

ApplyFlow is a high-performance, AI-enhanced job application tracker designed to streamline your career journey. It goes beyond simple list management by providing strategic resume intelligence and insights.

## 🚀 Key Features

- **Centralized Tracking**: Manage all your job applications in one sleek interface.
- **Stage Management**: Track progress from "Wishlist" to "Offer" with clear, color-coded visual stages.
- **Resume Intelligence**:
  - **Version Control**: Manage multiple resume versions tailored for different roles.
  - **AI Analysis**: Get detailed feedback on your resumes, including an overall score, identified strengths, weaknesses, and actionable improvements.
  - **Impact Rewrites**: AI-suggested rewrites for your resume bullet points to maximize professional impact.
- **Dynamic Dashboard**: View key metrics like total applications, interview conversion rates, and recent activity.
- **Responsive Design**: Fully optimized for mobile and desktop experiences.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions, Storage)
- **AI Engine**: Gemini (via Supabase Edge Functions)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Local Setup

1. **Clone the repository**:
   ```sh
   git clone <YOUR_GIT_URL>
   cd job-app-tracker
   ```

2. **Install dependencies**:
   ```sh
   npm install
   # or
   bun install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**:
   ```sh
   npm run dev
   # or
   bun run dev
   ```

## 🏗️ Architecture

ApplyFlow follows a modern, decoupled architecture:

- **Service Layer**: All database and AI interactions are abstracted into a dedicated service layer (`src/lib/services/`) for better maintainability and testability.
- **Edge Functions**: Complex processing, such as AI resume analysis and text extraction, is handled by Supabase Edge Functions to keep the frontend lightweight.
- **Shared UI Components**: Leverages `shadcn/ui` for a consistent, premium design language.

## 📜 License

This project is private and for educational/personal use.
