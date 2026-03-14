import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Clock, AlertTriangle, TrendingUp, Plus, Inbox } from "lucide-react";
import { APPLICATION_STAGES, STAGE_LABELS, STAGE_COLORS, type ApplicationStage } from "@/lib/types";
import { format, isToday, isPast, startOfWeek } from "date-fns";
import { StageBadge } from "@/components/StageBadge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { ActivityItem } from "@/components/ActivityItem";
import { getApplicationStats } from "@/lib/services/applications.service";
import { getDashboardReminders } from "@/lib/services/reminders.service";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["applications-stats", user?.id],
    queryFn: getApplicationStats,
    enabled: !!user,
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["reminders-dashboard", user?.id],
    queryFn: () => getDashboardReminders(10),
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
        <PageHeader title="Dashboard">
          <Link to="/applications/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Application
            </Button>
          </Link>
        </PageHeader>

        {/* Stats cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total" value={totalApps} icon={Briefcase} loading={loading} />
          <StatCard title="This Week" value={thisWeek} icon={TrendingUp} loading={loading} />
          <StatCard title="Due Today" value={todayReminders.length} icon={Clock} loading={loading} />
          <StatCard title="Overdue" value={overdueReminders.length} icon={AlertTriangle} loading={loading} variant="destructive" />
        </div>

        {/* Stage breakdown */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground font-heading">Pipeline</CardTitle>
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
                    <StageBadge stage={stage} className="py-1.5 px-3 cursor-pointer hover:bg-muted transition-colors">
                      <span className="font-bold ml-1">{stageCounts[stage]}</span>
                    </StageBadge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Reminders */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-4 shrink-0">
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground font-heading">Follow-ups</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-md border p-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : [...overdueReminders, ...todayReminders, ...upcomingReminders].length === 0 ? (
                <EmptyState icon={Inbox} message="No pending follow-ups" />
              ) : (
                <div className="space-y-2">
                  {[...overdueReminders, ...todayReminders, ...upcomingReminders].slice(0, 5).map((r) => {
                    const isOverdue = isPast(new Date(r.due_date)) && !isToday(new Date(r.due_date));
                    const isDueToday = isToday(new Date(r.due_date));
                    return (
                      <ActivityItem
                        key={r.id}
                        to={`/applications/${r.application_id}`}
                        title={r.title}
                        subtitle={`${(r as any).applications?.company_name} — ${(r as any).applications?.role_title}`}
                        badgeText={isOverdue ? "Overdue" : isDueToday ? "Today" : format(new Date(r.due_date), "MMM d")}
                        badgeVariant={isOverdue ? "destructive" : isDueToday ? "default" : "secondary"}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-4 shrink-0">
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground font-heading">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-md border p-3">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : recentApps.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  message="No applications yet"
                  action={
                    <Link to="/applications/new">
                      <Button size="sm" variant="outline">Add your first application</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {recentApps.map((app) => (
                    <ActivityItem
                      key={app.id}
                      to={`/applications/${app.id}`}
                      title={app.company_name}
                      subtitle={app.role_title}
                      badgeNode={<StageBadge stage={app.current_stage} className="ml-auto" />}
                    />
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
