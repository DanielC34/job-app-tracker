import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, Plus, Upload, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Resumes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_versions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addResume = useMutation({
    mutationFn: async () => {
      let uploadedPath: string | null = null;
      let uploadedUrl: string | null = fileUrl.trim() || null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file);
        if (uploadError) throw uploadError;
        uploadedPath = path;
      }

      const { error } = await supabase.from("resume_versions").insert({
        user_id: user!.id,
        label: label.trim(),
        file_url: uploadedUrl,
        file_path: uploadedPath,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      setLabel("");
      setFileUrl("");
      setFile(null);
      setShowForm(false);
      toast.success("Resume version added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      const resume = resumes?.find((r) => r.id === id);
      if (resume?.file_path) {
        await supabase.storage.from("resumes").remove([resume.file_path]);
      }
      const { error } = await supabase.from("resume_versions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    if (!file && !fileUrl.trim()) {
      toast.error("Upload a file or provide a URL");
      return;
    }
    addResume.mutate();
  };

  const getDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("resumes").createSignedUrl(filePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Resumes</h1>
          <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" /> Add Version
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume-label">Version Label *</Label>
                  <Input id="resume-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Frontend Engineer v2" required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" /> Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">{file?.name ?? "No file selected"}</span>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume-url">Or paste URL</Label>
                  <Input id="resume-url" type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addResume.isPending}>{addResume.isPending ? "Adding…" : "Add Resume"}</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (resumes?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No resume versions yet</p>
              <Button variant="outline" onClick={() => setShowForm(true)}>Add your first resume</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {resumes!.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.file_path && (
                      <Button variant="outline" size="sm" onClick={() => getDownloadUrl(r.file_path!)}>Download</Button>
                    )}
                    {r.file_url && !r.file_path && (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Open</Button>
                      </a>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove the resume version and its uploaded file.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteResume.mutate(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
