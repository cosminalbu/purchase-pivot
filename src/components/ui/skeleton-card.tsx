import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  showHeader?: boolean
  contentLines?: number
}

export function SkeletonCard({ showHeader = true, contentLines = 3 }: SkeletonCardProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <div className="space-y-3">
          {Array.from({ length: contentLines }).map((_, index) => (
            <Skeleton 
              key={index} 
              className={`h-4 ${
                index === 0 ? 'w-full' : 
                index === 1 ? 'w-3/4' : 
                'w-1/2'
              }`} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}