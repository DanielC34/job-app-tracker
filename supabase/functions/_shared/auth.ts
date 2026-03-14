import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "./cors.ts";

/**
 * Extracts and validates the auth token from the Authorization header.
 * Returns the authenticated user, or an error Response if invalid.
 */
export async function requireAuth(
    req: Request
): Promise<{ userId: string } | Response> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return errorResponse("Missing Authorization header", 401);
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
    );

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return errorResponse("Unauthorized", 401);
    }

    return { userId: user.id };
}
