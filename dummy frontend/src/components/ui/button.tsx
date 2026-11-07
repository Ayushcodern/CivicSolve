import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#2d5a43] text-white shadow-xs hover:bg-[#234634] border border-[#234634]",
        glass: "glass-pill-btn",
        glassPrimary: "glass-pill-primary",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline:
          "border border-zinc-300 bg-white shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 hover:border-zinc-400",
        secondary: "bg-zinc-100 text-zinc-900 shadow-2xs hover:bg-zinc-200 border border-zinc-200",
        ghost: "hover:bg-zinc-100 hover:text-zinc-900",
        link: "text-[#2d5a43] underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-[44px] px-4 py-2 text-sm",
        sm: "min-h-[36px] rounded-md px-3 text-xs",
        lg: "min-h-[48px] rounded-md px-8 text-base",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
