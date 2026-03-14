/**
 * Edge Function: follow-up-generator
 *
 * Drafts a professional follow-up email for a job application.
 *
 * Request body:
 * {
 *   applicationId: string   — ID of the application row
 *   companyName:   string   — company name
 *   roleTitle:     string   — job title
 *   currentStage:  string   — current application stage
 *   contactName?:  string   — optional recruiter/hiring manager name
 *   tone?:         "professional" | "friendly" | "concise"  — default "professional"
 *   context?:      string   — optional additional context (e.g. "had a great interview")
 * }
 *
 * Response:
 * {
 *   analysisType:  "followup_draft",
 *   applicationId: string,
 *   result: {
 *     subject: string,   // email subject line
 *     body:    string,   // full email body
 *     tone:    string    // tone used
 *   }
 * }
 */

import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const VALID_TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof VALID_TONES[number];

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

    const { applicationId, companyName, roleTitle, currentStage, contactName, tone, context } =
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

    const resolvedTone: Tone =
        typeof tone === "string" && VALID_TONES.includes(tone as Tone)
            ? (tone as Tone)
            : "professional";

    // TODO: Call AI model to generate the follow-up email
    const result = {
        analysisType: "followup_draft",
        applicationId,
        result: {
            subject: `Following up on ${roleTitle} application — ${companyName}`,
            body: `AI model not yet connected. Implement in the next phase.\n\nContext provided:\n- Company: ${companyName}\n- Role: ${roleTitle}\n- Stage: ${currentStage}\n- Contact: ${contactName ?? "N/A"}\n- Tone: ${resolvedTone}`,
            tone: resolvedTone,
        },
    };

    return jsonResponse(result, 200);
});
