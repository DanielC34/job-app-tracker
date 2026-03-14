import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { NOTE_TYPE_LABELS, type NoteType } from "@/lib/types";
import { format } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";

export function NotesTimeline({ applicationId }: { applicationId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("note");
  const [showForm, setShowForm] = useState(false);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["application-notes", applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("application_notes").insert({
        application_id: applicationId,
        user_id: user!.id,
        note_type: noteType,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-notes", applicationId] });
      setContent("");
      setShowForm(false);
      toast.success("Note added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNote.mutate();
  };

  const noteTypeColors: Record<NoteType, string> = {
    note: "secondary",
    status_change: "default",
    follow_up: "outline",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Timeline
        </CardTitle>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Note
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <div className="flex gap-2">
              <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NOTE_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add a note…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={5000}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addNote.isPending}>
                {addNote.isPending ? "Adding…" : "Add"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (notes?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
        ) : (
          <div className="space-y-3">
            {notes!.map((note) => (
              <div key={note.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={noteTypeColors[note.note_type] as any}>{NOTE_TYPE_LABELS[note.note_type]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-2">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
