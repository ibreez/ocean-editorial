import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#123B3A] text-white hover:bg-[#0F766E] focus-visible:ring-[#0F766E] active:bg-[#0B2C2B]",
        secondary:
          "bg-[#EDF2EF] text-[#182624] hover:bg-[#DCE4DF] focus-visible:ring-[#0F766E] border border-[#DCE4DF]",
        accent:
          "bg-[#D94343] text-white hover:bg-[#B92F35] focus-visible:ring-[#B92F35]",
        tertiary:
          "bg-transparent text-[#182624] hover:bg-[#EDF2EF] focus-visible:ring-[#0F766E]",
        outline:
          "border border-[#AAB9B2] bg-transparent text-[#182624] hover:bg-[#EDF2EF] focus-visible:ring-[#0F766E]",
        destructive:
          "bg-[#B42318] text-white hover:bg-[#911D13] focus-visible:ring-[#B42318]",
      },
      size: {
        sm: "h-9 px-3 rounded-[6px] text-xs min-h-[36px]",
        md: "h-11 px-4 rounded-[10px] text-sm min-h-[44px]",
        lg: "h-12 px-6 rounded-[10px] text-base min-h-[48px]",
        icon: "h-11 w-11 rounded-[10px] min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>މަޑުކޮށްލައްވާ...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
