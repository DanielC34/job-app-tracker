import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import {
  APPLICATION_STAGES, STAGE_LABELS,
  EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS,
  type ApplicationStage, type EmploymentType, type WorkMode,
} from "@/lib/types";
import { getApplicationForEdit, createApplication, updateApplication } from "@/lib/services/applications.service";
import { getResumeOptions } from "@/lib/services/resumes.service";

export default function ApplicationForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplicationForEdit(id!),
    enabled: isEdit,
  });

  const { data: resumes } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: getResumeOptions,
    enabled: !!user,
  });

  const [form, setForm] = useState({
    company_name: "",
    role_title: "",
    location: "",
    employment_type: "full_time" as EmploymentType,
    work_mode: "remote" as WorkMode,
    source: "",
    salary_min: "",
    salary_max: "",
    currency: "USD",
    applied_date: new Date().toISOString().split("T")[0],
    current_stage: "applied" as ApplicationStage,
    job_url: "",
    company_website: "",
    notes_summary: "",
    resume_version_id: "",
  });

  const [initialized, setInitialized] = useState(false);
  if (existing && !initialized) {
    setForm({
      company_name: existing.company_name,
      role_title: existing.role_title,
      location: existing.location,
      employment_type: existing.employment_type,
      work_mode: existing.work_mode,
      source: existing.source,
      salary_min: existing.salary_min?.toString() ?? "",
      salary_max: existing.salary_max?.toString() ?? "",
      currency: existing.currency ?? "USD",
      applied_date: existing.applied_date,
      current_stage: existing.current_stage,
      job_url: existing.job_url ?? "",
      company_website: existing.company_website ?? "",
      notes_summary: existing.notes_summary ?? "",
      resume_version_id: existing.resume_version_id ?? "",
    });
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        company_name: form.company_name.trim(),
        role_title: form.role_title.trim(),
        location: form.location.trim(),
        employment_type: form.employment_type,
        work_mode: form.work_mode,
        source: form.source.trim(),
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        currency: form.currency || "USD",
        applied_date: form.applied_date,
        current_stage: form.current_stage,
        job_url: form.job_url.trim() || null,
        company_website: form.company_website.trim() || null,
        notes_summary: form.notes_summary.trim() || null,
        resume_version_id: form.resume_version_id || null,
        user_id: user!.id,
      };

      if (isEdit) {
        await updateApplication(id!, payload);
      } else {
        await createApplication(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications-stats"] });
      toast.success(isEdit ? "Application updated" : "Application created");
      navigate("/applications");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.role_title.trim()) {
      toast.error("Company name and role title are required");
      return;
    }
    mutation.mutate();
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (isEdit && isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{isEdit ? "Edit Application" : "New Application"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company *</Label>
                  <Input id="company_name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_title">Role *</Label>
                  <Input id="role_title" value={form.role_title} onChange={(e) => set("role_title", e.target.value)} required maxLength={200} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" placeholder="LinkedIn, Indeed, Referral…" value={form.source} onChange={(e) => set("source", e.target.value)} maxLength={100} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={form.employment_type} onValueChange={(v) => set("employment_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Mode</Label>
                  <Select value={form.work_mode} onValueChange={(v) => set("work_mode", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(WORK_MODE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select value={form.current_stage} onValueChange={(v) => set("current_stage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Salary Min</Label>
                  <Input id="salary_min" type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Salary Max</Label>
                  <Input id="salary_max" type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} maxLength={3} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 flex flex-col pt-1">
                  <Label>Applied Date</Label>
                  <DatePicker
                    date={form.applied_date ? new Date(form.applied_date) : undefined}
                    setDate={(d) => set("applied_date", d ? format(d, "yyyy-MM-dd") : "")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resume Version</Label>
                  <Select value={form.resume_version_id || "none"} onValueChange={(v) => set("resume_version_id", v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {resumes?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job_url">Job URL</Label>
                  <Input id="job_url" type="url" value={form.job_url} onChange={(e) => set("job_url", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_website">Company Website</Label>
                  <Input id="company_website" type="url" value={form.company_website} onChange={(e) => set("company_website", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes_summary">Notes</Label>
                <Textarea id="notes_summary" value={form.notes_summary} onChange={(e) => set("notes_summary", e.target.value)} rows={3} maxLength={2000} />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={mutation.isPending} className="min-w-[100px]">
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mutation.isPending ? "Saving" : isEdit ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={mutation.isPending}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
