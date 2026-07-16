import { cn } from "@/lib/utils";
import React from "react";

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] gap-(--gap)",
        {
          "flex-row": !reverse,
          "flex-row-reverse": reverse,
        },
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around gap-(--gap) animate-[marquee_var(--duration)_linear_infinite] flex-row",
          {
            "group-hover:paused": pauseOnHover,
            "direction-[reverse]": reverse,
          }
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 justify-around gap-(--gap) animate-[marquee_var(--duration)_linear_infinite] flex-row",
          {
            "group-hover:paused": pauseOnHover,
            "direction-[reverse]": reverse,
          }
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}
