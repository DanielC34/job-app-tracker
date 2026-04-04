import type { Database } from "@/integrations/supabase/types";

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

export type ApplicationNote = Database["public"]["Tables"]["application_notes"]["Row"];
export type ApplicationNoteInsert = Database["public"]["Tables"]["application_notes"]["Insert"];

export type FollowUpReminder = Database["public"]["Tables"]["follow_up_reminders"]["Row"];
export type FollowUpReminderInsert = Database["public"]["Tables"]["follow_up_reminders"]["Insert"];
export type Resume = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};
export type ResumeInsert = Omit<Resume, "id" | "created_at">;

export type ResumeVersion = Database["public"]["Tables"]["resume_versions"]["Row"];
export type ResumeVersionInsert = Database["public"]["Tables"]["resume_versions"]["Insert"];

export type AiAnalysis = Database["public"]["Tables"]["ai_analyses"]["Row"];
export type AiAnalysisInsert = Database["public"]["Tables"]["ai_analyses"]["Insert"];

export type InterviewQuestion = {
  id: string;
  application_id: string;
  ai_analysis_id: string | null;
  question_text: string;
  category: string | null;
  tips: string | null;
  is_practiced: boolean;
  user_notes: string | null;
  created_at: string;
};
export type InterviewQuestionInsert = Omit<InterviewQuestion, "id" | "created_at">;
export type InterviewQuestionUpdate = Partial<InterviewQuestionInsert>;

export type ApplicationStage = Database["public"]["Enums"]["application_stage"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type WorkMode = Database["public"]["Enums"]["work_mode"];
export type NoteType = Database["public"]["Enums"]["note_type"];
export type ReminderStatus = Database["public"]["Enums"]["reminder_status"];
export type AnalysisType = Database["public"]["Enums"]["analysis_type"];

export const APPLICATION_STAGES: ApplicationStage[] = [
  "wishlist", "applied", "assessment", "interview", "offer", "rejected", "archived"
];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  wishlist: "bg-stage-wishlist",
  applied: "bg-stage-applied",
  assessment: "bg-stage-assessment",
  interview: "bg-stage-interview",
  offer: "bg-stage-offer",
  rejected: "bg-stage-rejected",
  archived: "bg-stage-archived",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  note: "Note",
  status_change: "Status Change",
  follow_up: "Follow-up",
};
