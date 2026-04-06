import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  STAGE_LABELS, STAGE_COLORS, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, NOTE_TYPE_LABELS,
  APPLICATION_STAGES, type ApplicationStage,
} from "@/lib/types";
import { format } from "date-fns";
import { Edit, Trash2, ExternalLink, ArrowLeft, FileQuestion } from "lucide-react";
import { NotesTimeline } from "@/components/NotesTimeline";
import { RemindersList } from "@/components/RemindersList";
import { EmptyState } from "@/components/EmptyState";
import { FollowUpCard } from "@/components/FollowUpCard";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApplication, deleteApplication, updateApplicationStage } from "@/lib/services/applications.service";
import { createStatusChangeNote } from "@/lib/services/notes.service";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: app, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application deleted");
      navigate("/applications");
    },
  });

  const stageMutation = useMutation({
    mutationFn: async (newStage: ApplicationStage) => {
      await updateApplicationStage(id!, newStage);
      await createStatusChangeNote(id!, user!.id, STAGE_LABELS[newStage]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["application-notes", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Stage updated");
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 mb-6" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-10 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!app) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <EmptyState
            icon={FileQuestion}
            message="Application not found"
            className="py-0"
            action={
              <>
                <p className="text-sm text-muted-foreground mb-6 -mt-2">This application may have been deleted.</p>
                <Link to="/applications">
                  <Button variant="outline">Back to list</Button>
                </Link>
              </>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2" onClick={() => navigate("/applications")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading break-words mb-1">
              {app.company_name}
            </h1>
            <p className="text-lg text-muted-foreground">{app.role_title}</p>
          </div>
          <div className="flex gap-2 shrink-0 self-start sm:self-auto">
            <Link to={`/applications/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete application?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete this application and all associated notes and reminders.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Details */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Stage</Label>
                <Select value={app.current_stage} onValueChange={(v) => stageMutation.mutate(v as ApplicationStage)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${STAGE_COLORS[s]}`} />
                          {STAGE_LABELS[s]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Detail label="Location" value={app.location} />
              <Detail label="Employment" value={EMPLOYMENT_TYPE_LABELS[app.employment_type]} />
              <Detail label="Work Mode" value={WORK_MODE_LABELS[app.work_mode]} />
              <Detail label="Source" value={app.source} />
              <Detail label="Applied" value={format(new Date(app.applied_date), "MMM d, yyyy")} />
              {(app.salary_min || app.salary_max) && (
                <Detail
                  label="Salary"
                  value={`${app.salary_min ? app.salary_min.toLocaleString() : "—"} – ${app.salary_max ? app.salary_max.toLocaleString() : "—"} ${app.currency}`}
                />
              )}
              {app.resume_versions && (
                <Detail label="Resume" value={(app.resume_versions as any).label} />
              )}
            </div>

            {(app.job_url || app.company_website) && (
              <>
                <Separator />
                <div className="flex gap-3 flex-wrap">
                  {app.job_url && (
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="h-3 w-3" /> Job Post
                      </Button>
                    </a>
                  )}
                  {app.company_website && (
                    <a href={app.company_website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="h-3 w-3" /> Company
                      </Button>
                    </a>
                  )}
                </div>
              </>
            )}

            {app.notes_summary && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{app.notes_summary}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Follow-Up Drafts */}
        <FollowUpCard applicationId={id!} />

        {/* Reminders */}
        <RemindersList applicationId={id!} />

        {/* Timeline */}
        <NotesTimeline applicationId={id!} />
      </div>
    </AppLayout>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
