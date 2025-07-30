import React, { useCallback, useEffect, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollProps {
  children: React.ReactNode
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage: () => void
  className?: string
  loadingComponent?: React.ReactNode
  threshold?: number
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  className,
  loadingComponent,
  threshold = 100,
}) => {
  const observerRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    })

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [handleIntersection, threshold])

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
    </div>
  )

  return (
    <div className={className}>
      {children}
      {hasNextPage && (
        <div ref={observerRef} className="w-full">
          {isFetchingNextPage && (loadingComponent || defaultLoadingComponent)}
        </div>
      )}
    </div>
  )
}

export const InfiniteScrollSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[80%]" />
          </div>
        </div>
      ))}
    </div>
  )
}