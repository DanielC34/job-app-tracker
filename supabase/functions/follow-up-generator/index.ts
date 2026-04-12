import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof VALID_TONES[number];

type DiagnosticStage =
  | "env_check"
  | "auth"
  | "request_parse"
  | "rate_limit_check"
  | "application_fetch"
  | "gemini_call"
  | "database_insert"
  | "unknown";

function stageError(stage: DiagnosticStage, error: unknown) {
  return new Response(
    JSON.stringify({
      error: "follow-up-generation-failed",
      stage,
      message: error instanceof Error ? error.message : "unknown",
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

Deno.serve(async (req: Request) => {
    console.log("--- FUNCTION REACHED: follow-up-generator ---");

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Stage 1: Env check
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL) return stageError("env_check", new Error("SUPABASE_URL is not set"));
    if (!SUPABASE_SERVICE_ROLE_KEY) return stageError("env_check", new Error("SUPABASE_SERVICE_ROLE_KEY is not set"));
    if (!GEMINI_API_KEY) return stageError("env_check", new Error("GEMINI_API_KEY is not set"));

    // Stage 2: Auth
    let authResult: { userId: string } | Response;
    try {
        authResult = await requireAuth(req);
    } catch (e) {
        return stageError("auth", e);
    }
    if (authResult instanceof Response) {
        return new Response(authResult.body, {
            status: authResult.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Stage 3: Request parse
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch (e) {
        return stageError("request_parse", e);
    }

    const { applicationId, tone, contactName, context } = body;

    if (!applicationId || typeof applicationId !== "string") {
        return new Response(JSON.stringify({ error: "Missing required field: applicationId" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const resolvedTone: Tone =
        typeof tone === "string" && VALID_TONES.includes(tone as Tone)
            ? (tone as Tone)
            : "professional";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { userId } = authResult;

    // Stage 4: Rate limit check
    try {
        const ONE_MINUTE_AGO = new Date(Date.now() - 60 * 1000).toISOString();
        const { count, error: rateError } = await supabase
            .from("rate_limits")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("action", "follow_up_generate")
            .gte("created_at", ONE_MINUTE_AGO);

        if (rateError) throw rateError;

        if ((count ?? 0) >= 5) {
            return new Response(
                JSON.stringify({ success: false, error: "Rate limit exceeded. Try again in a minute." }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }
    } catch (e) {
        return stageError("rate_limit_check", e);
    }

    // Stage 5: Application fetch
    let app: { company_name: string; role_title: string; current_stage: string; job_description: string | null; notes_summary: string | null };
    try {
        const { data, error: appError } = await supabase
            .from("applications")
            .select("company_name, role_title, current_stage, job_description, notes_summary")
            .eq("id", applicationId)
            .single();

        if (appError) throw appError;
        if (!data) throw new Error("No application found for the given ID");
        app = data;
    } catch (e) {
        return stageError("application_fetch", e);
    }

    // Stage 6: Gemini call
    let resultJson: { tone: string; subject: string; body: string };
    try {
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" },
                }),
            }
        );

        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(`Gemini responded with ${response.status}: ${JSON.stringify(errBody)}`);
        }

        const aiData = await response.json();
        const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) throw new Error("Empty response from AI model");

        resultJson = JSON.parse(resultText);
        if (!resultJson.subject || !resultJson.body) {
            throw new Error("AI response missing 'subject' or 'body' fields");
        }
    } catch (e) {
        return stageError("gemini_call", e);
    }

    // Stage 7: Database insert
    try {
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

        if (dbError) throw dbError;

        await supabase.from("rate_limits").insert({
            user_id: userId,
            action: "follow_up_generate",
        });

        return new Response(
            JSON.stringify({
                analysisType: "followup_draft",
                applicationId,
                emailId: email.id,
                result: resultJson,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (e) {
        return stageError("database_insert", e);
    }
});
