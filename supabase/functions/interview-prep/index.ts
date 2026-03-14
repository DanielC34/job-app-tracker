/**
 * Edge Function: interview-prep
 *
 * Generates tailored practice interview questions and talking points
 * for a given application context.
 *
 * Request body:
 * {
 *   applicationId:  string   — ID of the application row
 *   companyName:    string   — company being interviewed at
 *   roleTitle:      string   — job title
 *   currentStage:   string   — application stage (e.g. "interview")
 *   jobDescription?: string  — optional job posting text
 *   resumeContent?: string   — optional parsed resume text
 * }
 *
 * Response:
 * {
 *   analysisType:  "interview_prep",
 *   applicationId: string,
 *   result: {
 *     questions: Array<{
 *       question: string,
 *       context:  string,   // why this question is likely to be asked
 *       tip:      string    // how to approach answering it
 *     }>,
 *     talkingPoints: string[]   // key things to highlight in the interview
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

    const { applicationId, companyName, roleTitle, currentStage, jobDescription, resumeContent } =
        body as Record<string, unknown>;

    if (!applicationId || typeof applicationId !== "string") {
        return errorResponse("Missing required field: applicationId");
    }
    if (!companyName || typeof companyName !== "string") {
        return errorResponse("Missing required field: companyName");
    }
    if (!roleTitle || typeof roleTitle !== "string") {
        return errorResponse("Missing required field: roleTitle");
    }
    if (!currentStage || typeof currentStage !== "string") {
        return errorResponse("Missing required field: currentStage");
    }

    // TODO: Call AI model with application context
    const result = {
        analysisType: "interview_prep",
        applicationId,
        result: {
            questions: [
                {
                    question: "Tell me about yourself.",
                    context: "Standard opener used by most interviewers.",
                    tip: "AI model not yet connected. Implement in the next phase.",
                },
            ],
            talkingPoints: [],
        },
    };

    return jsonResponse(result, 200);
});
