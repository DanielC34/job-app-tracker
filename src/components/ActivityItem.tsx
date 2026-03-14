import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ActivityItemProps {
    title: string;
    subtitle?: string;
    badgeText?: string;
    badgeNode?: React.ReactNode;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    badgeDotClass?: string;
    to: string;
}

export function ActivityItem({
    title,
    subtitle,
    badgeText,
    badgeNode,
    badgeVariant = "secondary",
    badgeDotClass,
    to,
}: ActivityItemProps) {
    return (
        <Link to={to} className="block">
            <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium truncate">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    )}
                </div>
                {badgeNode ? (
                    badgeNode
                ) : badgeText ? (
                    <Badge variant={badgeVariant} className="shrink-0 gap-1.5 ml-auto">
                        {badgeDotClass && (
                            <span className={`h-2 w-2 rounded-full ${badgeDotClass}`} />
                        )}
                        {badgeText}
                    </Badge>
                ) : null}
            </div>
        </Link>
    );
}
