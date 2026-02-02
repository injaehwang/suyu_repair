import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", isLoading, children, ...props }, ref) => {
        const variants = {
            default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 shadow-sm",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
            ghost: "hover:bg-slate-100 hover:text-slate-900",
            link: "text-slate-900 underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-11 px-6 py-2", // Minimum 44px height for mobile as per guideline
            sm: "h-9 rounded-md px-3",
            lg: "h-12 rounded-md px-8",
            icon: "h-11 w-11",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
