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

  const { 
    applicationId, 
    companyName, 
    roleTitle, 
    currentStage, 
    jobDescription, 
    resumeContent,
    resumeVersionId // Added for relation
  } = body as Record<string, unknown>;

  if (!applicationId || typeof applicationId !== "string") {
    return errorResponse("Missing required field: applicationId");
  }

  if (!GEMINI_API_KEY) {
    return errorResponse("AI service is currently unavailable", 500);
  }

  const prompt = `You are an expert interview coach. Generate targeted interview questions and talking points for this candidate.
  
  Context:
  - Company: ${companyName || 'Unknown'}
  - Role: ${roleTitle || 'Unknown'}
  - Stage: ${currentStage || 'Unknown'}
  
  ${jobDescription ? `Job Description: ${jobDescription}` : ''}
  ${resumeContent ? `Candidate Resume: ${resumeContent}` : ''}
  
  You MUST return a JSON object with the following structure:
  {
    "questions": [
      {
        "question_text": "string",
        "category": "Technical" | "Behavioral" | "Cultural",
        "tips": "string"
      }
    ],
    "talkingPoints": ["string"]
  }
  
  Return ONLY the raw JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from AI provider");
    }

    const aiData = await response.json();
    const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("Empty response from AI model");

    const resultJson = JSON.parse(resultText);

    // --- Strict Validation ---
    if (!resultJson.questions || !Array.isArray(resultJson.questions)) {
        throw new Error("AI returned invalid question format: expected an array.");
    }

    // --- DB Operations ---
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Insert analysis record
    const { data: analysis, error: aError } = await supabase
      .from("ai_analyses")
      .insert({
        user_id: userId,
        application_id: applicationId,
        resume_version_id: resumeVersionId || null,
        analysis_type: "interview_prep",
        result_json: resultJson,
      })
      .select()
      .single();

    if (aError) throw new Error(`Failed to insert analysis record: ${aError.message}`);

    // 2. Insert individual questions with strict check
    const questionsToInsert = resultJson.questions.map((q: any) => {
      if (!q.question_text) {
        throw new Error("AI response missing mandatory 'question_text' field.");
      }
      return {
        application_id: applicationId,
        ai_analysis_id: analysis.id,
        question_text: q.question_text,
        category: q.category || "General",
        tips: q.tips || "No tips provided.",
      };
    });

    const { error: qError } = await supabase
      .from("interview_questions")
      .insert(questionsToInsert);

    if (qError) {
      throw new Error(`Failed to insert interview questions: ${qError.message}`);
    }

    return jsonResponse({
      analysisId: analysis.id,
      analysisType: "interview_prep",
      applicationId,
      result: resultJson,
    }, 200);

  } catch (error) {
    console.error("Interview prep error:", error);
    return errorResponse(error instanceof Error ? error.message : "An unexpected error occurred", 500);
  }
});
