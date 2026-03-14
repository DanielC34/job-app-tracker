/**
 * Edge Function: job-match-score
 *
 * Compares a resume's parsed content against a job description and returns
 * a compatibility score with matched/missing skills.
 *
 * Request body:
 * {
 *   applicationId:  string  — ID of the application row
 *   resumeId:       string  — ID of the resume_version row
 *   parsedContent:  string  — plain text of the resume
 *   jobDescription: string  — full text of the job posting
 * }
 *
 * Response:
 * {
 *   analysisType:  "job_match_score",
 *   applicationId: string,
 *   resumeId:      string,
 *   result: {
 *     score:          number,    // 0–100 match score
 *     matchedSkills:  string[],  // skills found in both resume and JD
 *     missingSkills:  string[],  // skills in JD but not in resume
 *     recommendation: string     // overall hiring signal text
 *   }
 * }
 */

import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
    const corsResult = handleCors(req);
    if (corsResult) return corsResult;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body");
    }

    const { applicationId, resumeId, parsedContent, jobDescription } =
        body as Record<string, unknown>;

    if (!applicationId || typeof applicationId !== "string") {
        return errorResponse("Missing required field: applicationId");
    }
    if (!resumeId || typeof resumeId !== "string") {
        return errorResponse("Missing required field: resumeId");
    }
    if (!parsedContent || typeof parsedContent !== "string" || parsedContent.trim().length < 50) {
        return errorResponse("parsedContent must be at least 50 characters");
    }
    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 50) {
        return errorResponse("jobDescription must be at least 50 characters");
    }

    // TODO: Call AI model with parsedContent + jobDescription
    const result = {
        analysisType: "job_match_score",
        applicationId,
        resumeId,
        result: {
            score: 0,
            matchedSkills: [],
            missingSkills: [],
            recommendation: "AI model not yet connected. Implement in the next phase.",
        },
    };

    return jsonResponse(result, 200);
});
