import { supabase } from "@/integrations/supabase/client";
import type { ReminderStatus } from "@/lib/types";

/**
 * Fetches all pending reminders for dashboard display, with related
 * application company/role info, ordered by due date ascending.
 */
export async function getDashboardReminders(limit = 10) {
    const { data, error } = await supabase
        .from("follow_up_reminders")
        .select("id, title, due_date, status, application_id, applications(company_name, role_title)")
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
}

/** Fetches all reminders for a single application, ordered by due date. */
export async function getRemindersForApplication(applicationId: string) {
    const { data, error } = await supabase
        .from("follow_up_reminders")
        .select("*")
        .eq("application_id", applicationId)
        .order("due_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export interface CreateReminderParams {
    applicationId: string;
    userId: string;
    title: string;
    dueDate: string;
}

/** Creates a new follow-up reminder for an application. */
export async function createReminder({ applicationId, userId, title, dueDate }: CreateReminderParams) {
    const { error } = await supabase.from("follow_up_reminders").insert({
        application_id: applicationId,
        user_id: userId,
        title: title.trim(),
        due_date: dueDate,
    });
    if (error) throw error;
}

/** Marks a reminder as done. */
export async function markReminderDone(id: string) {
    const { error } = await supabase
        .from("follow_up_reminders")
        .update({ status: "done" as ReminderStatus })
        .eq("id", id);
    if (error) throw error;
}
