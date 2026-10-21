import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[6px] bg-[#EDF2EF]", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
