import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useActivityLog, ActivityLog } from '@/hooks/useActivityLog'
import { formatDistanceToNow } from 'date-fns'
import { 
  FileText, 
  Building2, 
  User, 
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react'

const getActionIcon = (action: ActivityLog['action']) => {
  switch (action) {
    case 'created':
      return <Plus className="h-4 w-4" />
    case 'updated':
      return <Edit className="h-4 w-4" />
    case 'deleted':
      return <Trash2 className="h-4 w-4" />
    case 'approved':
      return <CheckCircle className="h-4 w-4" />
    case 'voided':
      return <XCircle className="h-4 w-4" />
    case 'sent':
      return <Send className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

const getEntityIcon = (entityType: ActivityLog['entity_type']) => {
  switch (entityType) {
    case 'purchase_order':
      return <FileText className="h-4 w-4" />
    case 'supplier':
      return <Building2 className="h-4 w-4" />
    case 'user':
      return <User className="h-4 w-4" />
    case 'system':
      return <Settings className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

const getActionColor = (action: ActivityLog['action']) => {
  switch (action) {
    case 'created':
      return 'bg-green-500'
    case 'updated':
      return 'bg-blue-500'
    case 'deleted':
      return 'bg-red-500'
    case 'approved':
      return 'bg-green-500'
    case 'voided':
      return 'bg-red-500'
    case 'sent':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

interface ActivityFeedProps {
  limit?: number
  entityType?: ActivityLog['entity_type']
  className?: string
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  limit = 20, 
  entityType,
  className 
}) => {
  const { activities, loading } = useActivityLog()

  const filteredActivities = entityType 
    ? activities.filter(activity => activity.entity_type === entityType)
    : activities

  const displayActivities = limit 
    ? filteredActivities.slice(0, limit)
    : filteredActivities

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-4">
            {displayActivities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            ) : (
              displayActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getEntityIcon(activity.entity_type)}
                        <Badge variant="outline" className="text-xs">
                          {activity.entity_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  {index < displayActivities.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}