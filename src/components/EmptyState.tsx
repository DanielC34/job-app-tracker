import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    message: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, message, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
            <Icon className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">{message}</p>
            {action}
        </div>
    );
}
