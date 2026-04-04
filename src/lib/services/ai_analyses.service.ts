import { supabase } from "@/integrations/supabase/client";
import type { AiAnalysis, AnalysisType } from "@/lib/types";

/**
 * Fetches the latest analysis of a specific type for a resume.
 */
export async function getLatestResumeAnalysis(resumeId: string, type: AnalysisType) {
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("resume_version_id", resumeId)
    .eq("analysis_type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AiAnalysis | null;
}

/**
 * Fetches the latest analysis of a specific type for an application.
 */
export async function getLatestApplicationAnalysis(applicationId: string, type: AnalysisType) {
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("application_id", applicationId)
    .eq("analysis_type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as AiAnalysis | null;
}

/**
 * Fetches all analyses for a specific target (resume or application).
 */
export async function getAnalyses(targetId: string, targetType: "resume" | "application") {
  const column = targetType === "resume" ? "resume_version_id" : "application_id";
  const { data, error } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq(column, targetId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as AiAnalysis[];
}
