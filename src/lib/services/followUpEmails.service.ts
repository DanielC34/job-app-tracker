import { supabase } from "@/integrations/supabase/client";
import type { FollowUpEmail } from "@/lib/types";

export interface GenerateFollowUpParams {
  applicationId: string;
  tone?: "professional" | "friendly" | "concise";
  contactName?: string;
  context?: string;
}

export interface FollowUpResponse {
  analysisType: "followup_draft";
  applicationId: string;
  emailId: string;
  result: {
    tone: string;
    subject: string;
    body: string;
  };
}

/**
 * Invokes the follow-up-generator Edge Function to draft an email.
 * The Edge Function persists the result to the follow_up_emails table.
 */
export async function generateFollowUpEmail(params: GenerateFollowUpParams): Promise<FollowUpResponse> {
  const { data, error } = await supabase.functions.invoke<FollowUpResponse>("follow-up-generator", {
    body: params,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No response from follow-up-generator");
  
  return data;
}

/**
 * Fetches all previously generated follow-up emails for an application.
 */
export async function getFollowUpEmails(applicationId: string): Promise<FollowUpEmail[]> {
  const { data, error } = await supabase
    .from("follow_up_emails")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as any) || [];
}
