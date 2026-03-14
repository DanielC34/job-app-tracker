import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { APPLICATION_STAGES, STAGE_LABELS, STAGE_COLORS, WORK_MODE_LABELS, type ApplicationStage, type WorkMode } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";

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
    queryFn: async () => {
      let query = supabase
        .from("applications")
        .select("*", { count: "exact" })
        .order("applied_date", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (stageFilter) query = query.eq("current_stage", stageFilter);
      if (workModeFilter) query = query.eq("work_mode", workModeFilter);
      if (search.trim()) {
        query = query.or(`company_name.ilike.%${search.trim()}%,role_title.ilike.%${search.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { applications: data, count: count ?? 0 };
    },
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Applications</h1>
          <Link to="/applications/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        </div>

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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : (data?.applications.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-3">
                {hasFilters ? "No applications match your filters" : "No applications yet"}
              </p>
              {!hasFilters && (
                <Link to="/applications/new">
                  <Button variant="outline">Add your first application</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {data!.applications.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`} className="block">
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{app.company_name}</p>
                          <Badge variant="outline" className="gap-1.5 shrink-0">
                            <span className={`h-2 w-2 rounded-full ${STAGE_COLORS[app.current_stage]}`} />
                            {STAGE_LABELS[app.current_stage]}
                          </Badge>
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
