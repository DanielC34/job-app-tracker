import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Clock, AlertTriangle, TrendingUp, Plus } from "lucide-react";
import { APPLICATION_STAGES, STAGE_LABELS, STAGE_COLORS, type ApplicationStage } from "@/lib/types";
import { format, isToday, isPast, startOfWeek } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["applications-stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, current_stage, applied_date, company_name, role_title, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["reminders-dashboard", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_reminders")
        .select("id, title, due_date, status, application_id, applications(company_name, role_title)")
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalApps = applications?.length ?? 0;
  const weekStart = startOfWeek(new Date());
  const thisWeek = applications?.filter((a) => new Date(a.applied_date) >= weekStart).length ?? 0;

  const stageCounts = APPLICATION_STAGES.reduce((acc, stage) => {
    acc[stage] = applications?.filter((a) => a.current_stage === stage).length ?? 0;
    return acc;
  }, {} as Record<ApplicationStage, number>);

  const overdueReminders = reminders?.filter((r) => isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date))) ?? [];
  const todayReminders = reminders?.filter((r) => isToday(new Date(r.due_date))) ?? [];
  const upcomingReminders = reminders?.filter((r) => !isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date))) ?? [];

  const recentApps = applications?.slice(0, 5) ?? [];

  const loading = appsLoading || remindersLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <Link to="/applications/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Application
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total" value={totalApps} icon={Briefcase} loading={loading} />
          <StatCard title="This Week" value={thisWeek} icon={TrendingUp} loading={loading} />
          <StatCard title="Due Today" value={todayReminders.length} icon={Clock} loading={loading} />
          <StatCard title="Overdue" value={overdueReminders.length} icon={AlertTriangle} loading={loading} variant="destructive" />
        </div>

        {/* Stage breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {APPLICATION_STAGES.map((stage) => (
                  <Link key={stage} to={`/applications?stage=${stage}`} className="shrink-0">
                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3 cursor-pointer hover:bg-muted transition-colors">
                      <span className={`h-2 w-2 rounded-full ${STAGE_COLORS[stage]}`} />
                      {STAGE_LABELS[stage]}
                      <span className="font-bold ml-1">{stageCounts[stage]}</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : [...overdueReminders, ...todayReminders, ...upcomingReminders].length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No pending follow-ups</p>
              ) : (
                <div className="space-y-2">
                  {[...overdueReminders, ...todayReminders, ...upcomingReminders].slice(0, 5).map((r) => {
                    const isOverdue = isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date));
                    const isDueToday = isToday(new Date(r.due_date));
                    return (
                      <Link key={r.id} to={`/applications/${r.application_id}`} className="block">
                        <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{r.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {(r as any).applications?.company_name} — {(r as any).applications?.role_title}
                            </p>
                          </div>
                          <Badge variant={isOverdue ? "destructive" : isDueToday ? "default" : "secondary"} className="shrink-0 ml-2">
                            {isOverdue ? "Overdue" : isDueToday ? "Today" : format(new Date(r.due_date), "MMM d")}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentApps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
                  <Link to="/applications/new">
                    <Button size="sm" variant="outline">Add your first application</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentApps.map((app) => (
                    <Link key={app.id} to={`/applications/${app.id}`} className="block">
                      <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{app.company_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.role_title}</p>
                        </div>
                        <Badge variant="outline" className="gap-1.5 shrink-0 ml-2">
                          <span className={`h-2 w-2 rounded-full ${STAGE_COLORS[app.current_stage]}`} />
                          {STAGE_LABELS[app.current_stage]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  variant,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  variant?: "destructive";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md shrink-0 ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
          <Icon className={`h-5 w-5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="font-heading text-2xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
