import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--color-brand-500),color-mix(in_srgb,var(--color-brand-500)_76%,white_24%))] text-white shadow-[0_14px_30px_rgba(49,82,207,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(49,82,207,0.28)]",
        secondary:
          "border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-2)_80%,transparent)] text-[var(--foreground)] hover:bg-[var(--surface-3)]",
        ghost: "text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--surface-1)_88%,transparent)]"
      },
      size: {
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
