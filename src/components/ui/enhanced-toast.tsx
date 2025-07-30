import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const enhancedToastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/20",
        warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
        loading: "border-primary/50 bg-primary/10 text-primary dark:border-primary dark:bg-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface EnhancedToastProps extends VariantProps<typeof enhancedToastVariants> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  duration?: number
  onClose?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  progress?: number
  showProgress?: boolean
}

const iconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
}

export function EnhancedToast({ 
  id, 
  title, 
  description, 
  variant = "default", 
  onClose, 
  action,
  progress,
  showProgress = false,
  ...props 
}: EnhancedToastProps) {
  const IconComponent = iconMap[variant || "default"]

  return (
    <div
      className={cn(enhancedToastVariants({ variant }))}
      {...props}
    >
      <div className="flex items-start space-x-3 flex-1">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent 
            className={cn(
              "h-5 w-5",
              variant === "loading" && "animate-spin"
            )} 
          />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold leading-none tracking-tight mb-1">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90 leading-relaxed">
              {description}
            </div>
          )}
          {showProgress && progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-background/20 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="h-8 px-3 text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 rounded-md p-1 h-6 w-6 opacity-70 hover:opacity-100"
        onClick={onClose}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  )
}

export type { EnhancedToastProps }