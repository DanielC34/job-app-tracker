import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "./cors.ts";

/**
 * Extracts and validates the auth token from the Authorization header.
 * Returns the authenticated user, or an error Response if invalid.
 */
export async function requireAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")! // safe here because platform injects correct one
  );

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    console.error("Auth error:", error);
    return new Response(
      JSON.stringify({ error: "Invalid JWT" }),
      { status: 401 }
    );
  }

  return { userId: data.user.id };
}
