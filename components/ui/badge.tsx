import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        // Unboxed editorial kicker (recommended for categories)
        editorial: "text-[#0F766E] font-semibold hover:text-[#123B3A]",
        // Breaking news tag with coral accent
        breaking: "bg-[#D94343] text-white px-2.5 py-0.5 rounded-[4px] font-bold text-[11px]",
        // Live status
        live: "bg-[#123B3A] text-white px-2 py-0.5 rounded-[4px] font-bold text-[11px]",
        // Subdued tag
        subtle: "text-[#53635F] text-xs",
        // Muted outline
        outline: "border border-[#DCE4DF] text-[#53635F] px-2 py-0.5 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "editorial",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
