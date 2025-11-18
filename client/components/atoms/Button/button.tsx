import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
 {
 variants: {
 variant: {
 default:
"bg-gradient-to-br from-primary to-primary/90 text-primary-foreground before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] before: before:",
 destructive:
"bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground",
 outline:
"border-2 border-border/60 bg-background/80",
 secondary:
"bg-gradient-to-br from-secondary to-secondary/95 text-secondary-foreground",
 ghost:"",
 link:"text-primary underline-offset-4",
 },
 size: {
 default:"h-10 px-6 py-2.5",
 sm:"h-9 rounded-lg px-4 text-xs",
 lg:"h-12 rounded-xl px-8 text-base",
 icon:"h-10 w-10 rounded-lg",
 },
 },
 defaultVariants: {
 variant:"default",
 size:"default",
 },
 },
);

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement>,
 VariantProps<typeof buttonVariants> {
 asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot :"button";
 return (
 <Comp
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 );
 },
);
Button.displayName ="Button";

export { Button, buttonVariants };
