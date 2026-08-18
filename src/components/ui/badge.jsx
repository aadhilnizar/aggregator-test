import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        success:
          "border-transparent bg-[color-mix(in_oklch,var(--success),transparent_86%)] text-[color-mix(in_oklch,var(--success),var(--foreground)_18%)]",
        warning:
          "border-transparent bg-[color-mix(in_oklch,var(--warning),transparent_84%)] text-[color-mix(in_oklch,var(--warning),var(--foreground)_38%)]",
        info:
          "border-transparent bg-[color-mix(in_oklch,var(--info),transparent_86%)] text-[color-mix(in_oklch,var(--info),var(--foreground)_12%)]",
        destructive:
          "border-transparent bg-destructive/12 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }
