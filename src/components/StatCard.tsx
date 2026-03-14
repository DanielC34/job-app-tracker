import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    loading: boolean;
    variant?: "destructive";
}

export function StatCard({ title, value, icon: Icon, loading, variant }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-lg shrink-0 ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
                        }`}
                >
                    <Icon
                        className={`h-5 w-5 ${variant === "destructive" ? "text-destructive" : "text-primary"
                            }`}
                    />
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
