import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                {title}
            </h1>
            {children}
        </div>
    );
}
