/**
 * Edge Function: resume-review
 *
 * Accepts a resume's parsed text content and optionally a job description.
 * Returns structured AI feedback on the resume.
 *
 * Request body:
 * {
 *   resumeId:      string   — ID of the resume_version row
 *   parsedContent: string   — plain text of the resume (from resume_versions.parsed_content)
 *   jobDescription?: string — optional job description to tailor feedback
 * }
 *
 * Response:
 * {
 *   analysisType: "resume_review",
 *   resumeId:     string,
 *   result: {
 *     score:       number,          // 0–100 overall quality score
 *     strengths:   string[],        // positive aspects
 *     weaknesses:  string[],        // areas needing improvement
 *     suggestions: string[],        // actionable improvement suggestions
 *     tailored:    boolean          // whether job description was used
 *   }
 * }
 */

import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

Deno.serve(async (req: Request) => {
    // 1. Handle CORS pre-flight
    const corsResult = handleCors(req);
    if (corsResult) return corsResult;

    // 2. Verify auth
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    // 3. Parse and validate body
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body");
    }

    const { resumeId, parsedContent, jobDescription } = body as Record<string, unknown>;

    if (!resumeId || typeof resumeId !== "string") {
        return errorResponse("Missing required field: resumeId");
    }
    if (!parsedContent || typeof parsedContent !== "string" || parsedContent.trim().length < 50) {
        return errorResponse("parsedContent must be at least 50 characters");
    }

    // 4. TODO: Call AI model (e.g. OpenAI / Gemini) with parsedContent + jobDescription
    //    For now, return a structured placeholder response.

    const result = {
        analysisType: "resume_review",
        resumeId,
        result: {
            score: 0,
            strengths: [],
            weaknesses: [],
            suggestions: [
                "AI model not yet connected. Implement in the next phase.",
            ],
            tailored: !!jobDescription,
        },
    };

    return jsonResponse(result, 200);
});
