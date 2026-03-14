import { supabase } from "@/integrations/supabase/client";
import type { ApplicationStage, ApplicationInsert, ApplicationUpdate } from "@/lib/types";

export interface ApplicationFilters {
    stage?: ApplicationStage | null;
    workMode?: string | null;
    search?: string | null;
    page?: number;
    pageSize?: number;
}

/** Fetches a paginated, filtered list of applications for the current user. */
export async function getApplications(filters: ApplicationFilters = {}) {
    const { stage, workMode, search, page = 0, pageSize = 20 } = filters;

    let query = supabase
        .from("applications")
        .select("*", { count: "exact" })
        .order("applied_date", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

    if (stage) query = query.eq("current_stage", stage);
    if (workMode) query = query.eq("work_mode", workMode as "remote" | "hybrid" | "onsite");
    if (search?.trim()) {
        query = query.or(
            `company_name.ilike.%${search.trim()}%,role_title.ilike.%${search.trim()}%`
        );
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { applications: data ?? [], count: count ?? 0 };
}

/**
 * Fetches a lightweight summary of all applications (id, stage, date, company,
 * role) — used by the Dashboard stats / pipeline cards.
 */
export async function getApplicationStats() {
    const { data, error } = await supabase
        .from("applications")
        .select("id, current_stage, applied_date, company_name, role_title, created_at")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

/** Fetches a single application with its linked resume version label. */
export async function getApplication(id: string) {
    const { data, error } = await supabase
        .from("applications")
        .select("*, resume_versions(label)")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

/** Fetches a single application by ID (full row, no joins) — used by the form. */
export async function getApplicationForEdit(id: string) {
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();
    if (error) throw error;
    return data;
}

/** Creates a new application record. */
export async function createApplication(payload: ApplicationInsert) {
    const { error } = await supabase.from("applications").insert(payload);
    if (error) throw error;
}

/** Updates an existing application record. */
export async function updateApplication(id: string, payload: ApplicationUpdate) {
    const { error } = await supabase.from("applications").update(payload).eq("id", id);
    if (error) throw error;
}

/** Updates only the stage of an application. */
export async function updateApplicationStage(id: string, stage: ApplicationStage) {
    const { error } = await supabase
        .from("applications")
        .update({ current_stage: stage })
        .eq("id", id);
    if (error) throw error;
}

/** Deletes an application (cascade deletes notes and reminders via DB constraints). */
export async function deleteApplication(id: string) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) throw error;
}
