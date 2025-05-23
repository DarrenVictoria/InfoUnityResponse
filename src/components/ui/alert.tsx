import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
    "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
                warning: "border-orange-500/50 text-orange-600 dark:border-orange-500 [&>svg]:text-orange-600",
                success: "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600",
            },
            severity: {
                low: "border-l-4 border-l-blue-500",
                medium: "border-l-4 border-l-orange-500",
                high: "border-l-4 border-l-red-500",
                critical: "border-l-4 border-l-red-700 bg-red-50",
            }
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
    severity?: "low" | "medium" | "high" | "critical"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant, severity, ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant, severity }), className)}
            {...props}
        />
    )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }