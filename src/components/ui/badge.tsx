import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        danger: "border-transparent bg-danger text-danger-foreground",
        info: "border-transparent bg-info text-info-foreground",
        critical: "border-transparent bg-priority-critical text-white",
        high: "border-transparent bg-priority-high text-white",
        medium: "border-transparent bg-priority-medium text-warning-foreground",
        low: "border-transparent bg-priority-low text-white",
        en_ejecucion: "border-info/30 bg-info/15 text-info",
        planificado: "border-transparent bg-muted text-muted-foreground",
        completado: "border-success/30 bg-success/15 text-success",
        retrasado: "border-warning/30 bg-warning/15 text-warning",
        en_riesgo: "border-danger/30 bg-danger/15 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
