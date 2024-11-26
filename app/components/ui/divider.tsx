import { cn } from "~/lib/utils";

interface DividerProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Divider({ className, children, ...props }: DividerProps) {
  return (
    <div className="flex items-center w-full">
      <span className="relative h-px border-t w-full flex-auto border-primary/30 border-dashed">

      </span>

      <span className={cn("text-primary/60 text-sm", className)} {...props}>
        {children}
      </span>

      <span className="relative h-px border-t w-full flex-auto border-primary/30 border-dashed">

      </span>
    </div>
  )
}