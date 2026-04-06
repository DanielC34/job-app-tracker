import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const VALID_TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof VALID_TONES[number];

Deno.serve(async (req: Request) => {
    const corsResult = handleCors(req);
    if (corsResult) return corsResult;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    // const { userId } = authResult; // Not strictly needed if we fetch application in Function

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return errorResponse("Invalid JSON body");
    }

    const { applicationId, tone, contactName, context } = body as Record<string, unknown>;

    if (!applicationId || typeof applicationId !== "string") {
        return errorResponse("Missing required field: applicationId");
    }

    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set");
        return errorResponse("AI service is currently unavailable", 500);
    }

    const resolvedTone: Tone =
        typeof tone === "string" && VALID_TONES.includes(tone as Tone)
            ? (tone as Tone)
            : "professional";

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Fetch application metadata
    const { data: app, error: appError } = await supabase
        .from("applications")
        .select("company_name, role_title, current_stage, job_description, notes_summary")
        .eq("id", applicationId)
        .single();

    if (appError || !app) {
        console.error("Error fetching application:", appError);
        return errorResponse("Application not found", 404);
    }

    // 2. Craft Gemini Prompt
    const toneInstructions: Record<Tone, string> = {
        professional: "Use formal language, be brief and polite, and end with a clear next step or call to action.",
        friendly: "Use warm and personable language, show light enthusiasm, and address the contact by their first name if provided. Keep it professional but approachable.",
        concise: "Keep it to 3-4 sentences maximum. Use a subject line under 8 words. No filler phrases or fluff.",
    };

    const prompt = `You are a professional career assistant. Draft a follow-up email for a job application.

    Context:
    - Company: ${app.company_name}
    - Role: ${app.role_title}
    - Current Stage: ${app.current_stage}
    - Recruiter/Contact Name: ${contactName || "the hiring team"}
    - Additional Context: ${context || "None provided"}
    - Job Description: ${app.job_description || "Not available"}
    - Previous Notes: ${app.notes_summary || "None"}

    Instructions:
    - Tone: ${resolvedTone}
    - ${toneInstructions[resolvedTone]}
    - Ensure the email is tailored to the company and role.
    - DO NOT use placeholders like [Company Name] or [Date]; use the provided context or omit if unknown.

    Return the result in JSON format with this exact schema:
    {
      "tone": "${resolvedTone}",
      "subject": "string",
      "body": "string"
    }

    Return ONLY the raw JSON.`;

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

        // 3. Strict Validation
        if (!resultJson.subject || !resultJson.body) {
            throw new Error("AI response missing mandatory 'subject' or 'body' fields");
        }

        // 4. Store in database
        const { data: email, error: dbError } = await supabase
            .from("follow_up_emails")
            .insert({
                application_id: applicationId,
                tone: resolvedTone,
                subject: resultJson.subject,
                body: resultJson.body,
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database error storing follow-up email:", dbError);
            throw new Error("Failed to store generated email");
        }

        return jsonResponse({
            analysisType: "followup_draft",
            applicationId,
            emailId: email.id,
            result: resultJson,
        }, 200);

    } catch (error) {
        console.error("Follow-up generation error:", error);
        return errorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
    }
});
