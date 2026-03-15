import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, isPast, isToday } from "date-fns";
import { Bell, Plus, Check } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { getRemindersForApplication, createReminder, markReminderDone } from "@/lib/services/reminders.service";

export function RemindersList({ applicationId }: { applicationId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["application-reminders", applicationId],
    queryFn: () => getRemindersForApplication(applicationId),
  });

  const addReminder = useMutation({
    mutationFn: () => createReminder({
      applicationId,
      userId: user!.id,
      title,
      dueDate,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-reminders", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["reminders-dashboard"] });
      setTitle("");
      setDueDate("");
      setShowForm(false);
      toast.success("Reminder added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const markDone = useMutation({
    mutationFn: (id: string) => markReminderDone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application-reminders", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["reminders-dashboard"] });
      toast.success("Marked as done");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    addReminder.mutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <Bell className="h-4 w-4" /> Reminders
        </CardTitle>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-3 bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Title</Label>
              <Input id="reminder-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} placeholder="Follow up on application…" />
            </div>
            <div className="space-y-2 flex flex-col pt-1">
              <Label>Due Date</Label>
              <DatePicker
                date={dueDate ? new Date(dueDate) : undefined}
                setDate={(d) => setDueDate(d ? format(d, "yyyy-MM-dd") : "")}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addReminder.isPending}>Add</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (reminders?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No reminders</p>
        ) : (
          <div className="space-y-2">
            {reminders!.map((r) => {
              const overdue = r.status === "pending" && isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date));
              const today = r.status === "pending" && isToday(new Date(r.due_date));
              return (
                <div key={r.id} className={`flex items-center justify-between border rounded-md p-3 ${r.status === "done" ? "opacity-50" : ""}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${r.status === "done" ? "line-through" : ""}`}>{r.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(r.due_date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {overdue && <Badge variant="destructive">Overdue</Badge>}
                    {today && <Badge>Today</Badge>}
                    {r.status === "done" && <Badge variant="secondary">Done</Badge>}
                    {r.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => markDone.mutate(r.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
