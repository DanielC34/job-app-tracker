import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validate Authentication
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    
    // 2. Parse Request Body
    const body = await req.json();
    const { resume, jobDescription } = body;

    if (!resume || !jobDescription) {
       return new Response(
         JSON.stringify({ error: "Missing resume or jobDescription" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
    }

    // 3. Process Logic (Placeholder for job-match-score)
    // Here you would typically integrate with an LLM or matching algorithm
    const score = 85; 
    const strengths = ["Matches required skills", "Sufficient experience"];
    const weaknesses = ["Missing specific certification"];

    return new Response(
      JSON.stringify({ score, strengths, weaknesses }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
