import { supabase } from "@/integrations/supabase/client";

/** Fetches all resume versions for the current user, newest first. */
export async function getResumes() {
    const { data, error } = await supabase
        .from("resume_versions")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

/** Fetches only id + label — used to populate the resume picker in the application form. */
export async function getResumeOptions() {
    const { data, error } = await supabase
        .from("resume_versions")
        .select("id, label")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export interface CreateResumeParams {
    userId: string;
    label: string;
    file?: File | null;
    fileUrl?: string | null;
}

/** Uploads a file (if provided) then inserts a new resume_version row. */
export async function createResume({ userId, label, file, fileUrl }: CreateResumeParams) {
    let uploadedPath: string | null = null;
    let uploadedUrl: string | null = fileUrl?.trim() || null;

    if (file) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from("resumes")
            .upload(path, file);
        if (uploadError) throw uploadError;
        uploadedPath = path;
    }

    const { error } = await supabase.from("resume_versions").insert({
        user_id: userId,
        label: label.trim(),
        file_url: uploadedUrl,
        file_path: uploadedPath,
    });
    if (error) throw error;
}

/** Deletes a resume row AND removes the stored file from the storage bucket if present. */
export async function deleteResume(id: string, filePath?: string | null) {
    if (filePath) {
        await supabase.storage.from("resumes").remove([filePath]);
    }
    const { error } = await supabase.from("resume_versions").delete().eq("id", id);
    if (error) throw error;
}

/** Creates a short-lived signed URL (1 hour) for downloading a stored resume file. */
export async function getResumeDownloadUrl(filePath: string): Promise<string | null> {
    const { data } = await supabase.storage
        .from("resumes")
        .createSignedUrl(filePath, 3600);
    return data?.signedUrl ?? null;
}
