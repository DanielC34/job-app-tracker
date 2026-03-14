import { Badge } from "@/components/ui/badge";
import { type ApplicationStage, STAGE_LABELS, STAGE_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
    stage: ApplicationStage;
    className?: string;
    children?: React.ReactNode;
}

export function StageBadge({ stage, className, children }: StageBadgeProps) {
    return (
        <Badge variant="outline" className={cn("gap-1.5 shrink-0", className)}>
            <span className={cn("h-2 w-2 rounded-full", STAGE_COLORS[stage])} />
            {STAGE_LABELS[stage]}
            {children}
        </Badge>
    );
}
