import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
"flex min-h-[100px] w-full rounded-lg border-2 border-border/50 bg-background/80 px-4 py-3 text-sm ring-offset-background ease-out placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 focus-visible:border-primary focus-visible: focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 resize-none",
 className,
 )}
 ref={ref}
 {...props}
 />
 );
 },
);
Textarea.displayName ="Textarea";

export { Textarea };
