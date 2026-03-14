import { supabase } from "@/integrations/supabase/client";
import type { NoteType } from "@/lib/types";

/** Fetches all notes for a single application, newest first. */
export async function getNotesForApplication(applicationId: string) {
    const { data, error } = await supabase
        .from("application_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export interface CreateNoteParams {
    applicationId: string;
    userId: string;
    noteType: NoteType;
    content: string;
}

/** Creates a new note on an application. */
export async function createNote({ applicationId, userId, noteType, content }: CreateNoteParams) {
    const { error } = await supabase.from("application_notes").insert({
        application_id: applicationId,
        user_id: userId,
        note_type: noteType,
        content: content.trim(),
    });
    if (error) throw error;
}

/** Creates an automatic "status_change" note (called after a stage transition). */
export async function createStatusChangeNote(applicationId: string, userId: string, stageLabel: string) {
    return createNote({
        applicationId,
        userId,
        noteType: "status_change",
        content: `Stage changed to ${stageLabel}`,
    });
}
