import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, X, Inbox, SearchX } from "lucide-react";
import { APPLICATION_STAGES, STAGE_LABELS, STAGE_COLORS, WORK_MODE_LABELS, type ApplicationStage, type WorkMode } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";
import { StageBadge } from "@/components/StageBadge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { getApplications } from "@/lib/services/applications.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 20;

export default function ApplicationsList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const stageFilter = searchParams.get("stage") as ApplicationStage | null;
  const workModeFilter = searchParams.get("workMode") as WorkMode | null;
  const page = parseInt(searchParams.get("page") ?? "0");

  const { data, isLoading } = useQuery({
    queryKey: ["applications", user?.id, stageFilter, workModeFilter, search, page],
    queryFn: () => getApplications({
      stage: stageFilter,
      workMode: workModeFilter,
      search,
      page,
      pageSize: PAGE_SIZE,
    }),
    enabled: !!user,
  });

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", search.trim() || null);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  const hasFilters = stageFilter || workModeFilter || searchParams.get("search");
  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title="Applications">
          <Link to="/applications/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        </PageHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex w-full sm:w-auto gap-2">
            <Select value={stageFilter ?? "all"} onValueChange={(v) => setFilter("stage", v === "all" ? null : v)}>
              <SelectTrigger className="flex-1 sm:w-40">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {APPLICATION_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={workModeFilter ?? "all"} onValueChange={(v) => setFilter("workMode", v === "all" ? null : v)}>
              <SelectTrigger className="flex-1 sm:w-36">
                <SelectValue placeholder="Work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                {(["remote", "hybrid", "onsite"] as WorkMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{WORK_MODE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 gap-1 px-2 sm:px-3">
                <X className="h-4 w-4 hidden sm:inline-block" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <>
            {/* Desktop Table Skeletons */}
            <div className="hidden md:block rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company & Role</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Card Skeletons */}
            <div className="space-y-2 md:hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex flex-col gap-2 p-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (data?.applications.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-16 p-6">
              <EmptyState
                icon={hasFilters ? SearchX : Inbox}
                message={hasFilters ? "No applications match your filters" : "No applications yet"}
                className="py-0"
                action={
                  !hasFilters ? (
                    <Link to="/applications/new">
                      <Button variant="outline">Add your first application</Button>
                    </Link>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company & Role</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.applications.map((app) => (
                    <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.location.href = `/applications/${app.id}`}>
                      <TableCell>
                        <div className="font-medium text-foreground">{app.company_name}</div>
                        <div className="text-sm text-muted-foreground">{app.role_title}</div>
                      </TableCell>
                      <TableCell>
                        <StageBadge stage={app.current_stage} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.location || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(app.applied_date), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-2 md:hidden">
              {data!.applications.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`} className="block">
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{app.company_name}</p>
                          <StageBadge stage={app.current_stage} />
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{app.role_title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {app.location && <span>{app.location}</span>}
                          <span>{format(new Date(app.applied_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setFilter("page", String(page - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setFilter("page", String(page + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
