import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req: Request) => {
    const corsResult = handleCors(req);
    if (corsResult) return corsResult;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

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

    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set");
        return errorResponse("AI service is currently unavailable", 500);
    }

    const prompt = `You are a professional technical recruiter. Compare the following resume against the job description and provide a match analysis.
Tailor your feedback to be professional, objective, and constructive.

The JSON response MUST follow this exact schema:
{
  "score": number (0-100),
  "summary": string (overall match summary),
  "matched_skills": string[] (skills/experience present in both),
  "missing_skills": string[] (skills/experience in JD but missing in resume),
  "recommendations": string[] (how to improve the resume or interview prep for this specific role)
}

Resume Text:
${parsedContent}

Job Description:
${jobDescription}

Return only the raw JSON.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json",
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error:", errorData);
            throw new Error("Failed to get response from AI provider");
        }

        const aiData = await response.json();
        const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
            throw new Error("Empty response from AI model");
        }

        let resultJson;
        try {
            resultJson = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse AI JSON:", resultText);
            throw new Error("Invalid format received from AI model");
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        const { data: analysis, error: dbError } = await supabase
            .from("ai_analyses")
            .insert({
                user_id: userId,
                application_id: applicationId,
                resume_version_id: resumeId,
                analysis_type: "job_match_score",
                result_json: resultJson,
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database error storing inspection:", dbError);
            throw new Error("Failed to store analysis result");
        }

        return jsonResponse({
            analysisId: analysis.id,
            analysisType: "job_match_score",
            applicationId,
            resumeId,
            result: resultJson,
        }, 200);

    } catch (error) {
        console.error("Job match scoring error:", error);
        return errorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
    }
});
