import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";
import { requireAuth } from "../_shared/auth.ts";
import { handleCors, errorResponse, jsonResponse } from "../_shared/cors.ts";

const VALID_TONES = ["professional", "friendly", "concise"] as const;
type Tone = typeof VALID_TONES[number];

Deno.serve(async (req: Request) => {
  console.log("--- FUNCTION REACHED: follow-up-generator ---");

  // 1. Handle CORS pre-flight
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  // 2. Env check
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return errorResponse("Server configuration error (Supabase)", 500);
  }

  // 3. Verify Auth
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  // 4. Parse request
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (e) {
    return errorResponse("Invalid JSON body", 400);
  }

  const { applicationId, tone, contactName, context } = body;

  if (!applicationId || typeof applicationId !== "string") {
    return errorResponse("Missing required field: applicationId", 400);
  }

  const resolvedTone: Tone =
    typeof tone === "string" && VALID_TONES.includes(tone as Tone)
      ? (tone as Tone)
      : "professional";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 5. Rate limit check
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
      return errorResponse("Rate limit exceeded. Try again in a minute.", 429);
    }
  } catch (e) {
    console.error("Rate limit check failed:", e);
    return errorResponse("Failed to verify rate limits", 500);
  }

  // 6. Application fetch
  let app: { company_name: string; role_title: string; current_stage: string; job_description: string | null; notes_summary: string | null };
  try {
    const { data, error: appError } = await supabase
      .from("applications")
      .select("company_name, role_title, current_stage, job_description, notes_summary")
      .eq("id", applicationId)
      .single();

    if (appError) throw appError;
    if (!data) return errorResponse("No application found for the given ID", 404);
    app = data;
  } catch (e) {
    console.error("Application fetch failed:", e);
    return errorResponse("Failed to fetch application details", 500);
  }

  // 7. Gemini call with Fallback
  let resultJson: { tone: string; subject: string; body: string };
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
      throw new Error(`Gemini responded with ${response.status}`);
    }

    const aiData = await response.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Empty response from AI model");

    resultJson = JSON.parse(resultText);
    if (!resultJson.subject || !resultJson.body) {
      throw new Error("AI response missing 'subject' or 'body' fields");
    }
  } catch (e) {
    console.error("Gemini call failed, using fallback:", e);
    // Fallback response
    const namePart = contactName ? `Hi ${contactName},` : "Hello,";
    let bodyText = "";
    
    if (resolvedTone === "friendly") {
      bodyText = `${namePart}\n\nI hope you're having a great week! I wanted to follow up on my application for the ${app.role_title} role at ${app.company_name}.\n\nI'm still very interested in the position and would love to know if there are any updates regarding the next steps.\n\nThanks so much for your time and consideration!\n\nBest regards,`;
    } else if (resolvedTone === "concise") {
      bodyText = `${namePart}\n\nFollowing up on my application for the ${app.role_title} position at ${app.company_name}. Please let me know if there are any updates or if you need additional information from me.\n\nThank you,`;
    } else {
      bodyText = `${namePart}\n\nI am writing to follow up on my recent application for the ${app.role_title} position with ${app.company_name}.\n\nI remain very interested in the opportunity to join your team and contribute to your goals. Please let me know if you need any further information or materials from my end to assist with the evaluation process.\n\nThank you for your time and consideration.\n\nSincerely,`;
    }

    resultJson = {
      tone: resolvedTone,
      subject: `Checking in: ${app.role_title} Application - ${app.company_name}`,
      body: bodyText
    };
  }

  // 8. Database insert
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

    return jsonResponse({
      analysisType: "followup_draft",
      applicationId,
      emailId: email.id,
      result: resultJson,
    });
  } catch (e) {
    console.error("Database insert failed:", e);
    return errorResponse("Failed to save follow-up email", 500);
  }
});
