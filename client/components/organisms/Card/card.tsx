import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn(
"relative rounded-xl border-[1.5px] border-border/70 bg-card text-card-foreground shadow-[0_2px_8px_hsl(var(--foreground)/0.06),0_1px_3px_hsl(var(--foreground)/0.09),0_0_0_1px_hsl(var(--border)/0.15)] transition-all duration-300 hover:shadow-[0_8px_16px_hsl(var(--foreground)/0.08),0_4px_8px_hsl(var(--foreground)/0.06),0_0_0_1.5px_hsl(var(--primary)/0.2)] hover:border-primary/40 hover:-translate-y-0.5",
 className,
 )}
 {...props}
 />
));
Card.displayName ="Card";

const CardHeader = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex flex-col space-y-1.5 p-5", className)}
 {...props}
 />
));
CardHeader.displayName ="CardHeader";

const CardTitle = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
 <h3
 ref={ref}
 className={cn(
"text-base md:text-lg font-medium leading-tight tracking-tight",
 className,
 )}
 {...props}
 />
));
CardTitle.displayName ="CardTitle";

const CardDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <p
 ref={ref}
 className={cn("text-sm text-muted-foreground leading-snug", className)}
 {...props}
 />
));
CardDescription.displayName ="CardDescription";

const CardContent = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
CardContent.displayName ="CardContent";

const CardFooter = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
 ref={ref}
 className={cn("flex items-center p-5 pt-0 gap-2", className)}
 {...props}
 />
));
CardFooter.displayName ="CardFooter";

export {
 Card,
 CardHeader,
 CardFooter,
 CardTitle,
 CardDescription,
 CardContent,
};
