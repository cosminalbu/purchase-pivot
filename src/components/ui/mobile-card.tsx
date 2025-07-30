import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface MobileCardProps {
  children: ReactNode
  className?: string
}

export function MobileCard({ children, className = "" }: MobileCardProps) {
  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface MobileCardFieldProps {
  label: string
  value: ReactNode
  className?: string
}

export function MobileCardField({ label, value, className = "" }: MobileCardFieldProps) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-border last:border-b-0 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}