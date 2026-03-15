/**
 * ai.service.ts — Frontend helpers for invoking Supabase Edge Functions.
 *
 * All functions use `supabase.functions.invoke()` which automatically:
 * - attaches the user's auth token
 * - sets the correct base URL for the project's Edge Functions
 * - handles CORS
 *
 * Usage pattern in a component:
 *
 *   const mutation = useMutation({
 *     mutationFn: () => invokeResumeReview({ resumeId, parsedContent }),
 *     onSuccess: (data) => { ... },
 *     onError: (err) => toast.error(err.message),
 *   });
 */

import { supabase } from "@/integrations/supabase/client";
import type { AnalysisType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Shared response envelope from every Edge Function
// ---------------------------------------------------------------------------

export interface AiErrorResponse {
    error: string;
}

export interface AiSuccessResponse<T> {
    analysisId: string;
    analysisType: AnalysisType;
    result: T;
}

async function invokeFunction<T>(
    functionName: string,
    payload: any
): Promise<T> {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: payload,
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error(`No response from ${functionName}`);
    return data;
}

// ---------------------------------------------------------------------------
// resume-review
// ---------------------------------------------------------------------------

export interface ResumeReviewResult {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    suggested_rewrites: Array<{ original: string; rewrite: string }>;
}

export interface ResumeReviewParams {
    resumeId: string;
    parsedContent: string;
    jobDescription?: string;
}

export function invokeResumeReview(params: ResumeReviewParams) {
    return invokeFunction<AiSuccessResponse<ResumeReviewResult>>(
        "resume-review",
        params
    );
}

// ---------------------------------------------------------------------------
// job-match-score
// ---------------------------------------------------------------------------

export interface JobMatchScoreResult {
    score: number;
    summary: string;
    matched_skills: string[];
    missing_skills: string[];
    recommendations: string[];
}

export interface JobMatchScoreParams {
    applicationId: string;
    resumeId: string;
    parsedContent: string;
    jobDescription: string;
}

export function invokeJobMatchScore(params: JobMatchScoreParams) {
    return invokeFunction<AiSuccessResponse<JobMatchScoreResult>>(
        "job-match-score",
        params
    );
}

/**
 * Fetches the latest job match analysis for a specific application and resume version.
 */
export async function getLatestJobMatchAnalysis(applicationId: string, resumeId: string) {
    const { data, error } = await supabase
        .from("ai_analyses")
        .select("*")
        .eq("application_id", applicationId)
        .eq("resume_id", resumeId)
        .eq("analysis_type", "job_match_score")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Fetches all AI analyses (match scores, interview prep, etc.) for a specific application.
 */
export async function getAnalysesForApplication(applicationId: string) {
    const { data, error } = await supabase
        .from("ai_analyses")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

// ---------------------------------------------------------------------------
// interview-prep
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
    question: string;
    context: string;
    tip: string;
}

export interface InterviewPrepResult {
    questions: InterviewQuestion[];
    talkingPoints: string[];
}

export interface InterviewPrepParams {
    applicationId: string;
    companyName: string;
    roleTitle: string;
    currentStage: string;
    jobDescription?: string;
    resumeContent?: string;
}

export function invokeInterviewPrep(params: InterviewPrepParams) {
    return invokeFunction<AiSuccessResponse<InterviewPrepResult>>(
        "interview-prep",
        params
    );
}

// ---------------------------------------------------------------------------
// follow-up-generator
// ---------------------------------------------------------------------------

export interface FollowUpResult {
    subject: string;
    body: string;
    tone: string;
}

export interface FollowUpParams {
    applicationId: string;
    companyName: string;
    roleTitle: string;
    currentStage: string;
    contactName?: string;
    tone?: "professional" | "friendly" | "concise";
    context?: string;
}

export function invokeFollowUpGenerator(params: FollowUpParams) {
    return invokeFunction<AiSuccessResponse<FollowUpResult>>(
        "follow-up-generator",
        params
    );
}
