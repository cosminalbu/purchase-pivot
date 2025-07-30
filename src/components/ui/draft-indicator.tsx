import * as React from "react";
import { Save, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DraftIndicatorProps {
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  hasDraft?: boolean;
  onRestoreDraft?: () => void;
  onSaveDraft?: () => void;
  className?: string;
}

export const DraftIndicator = ({
  lastSaved,
  hasUnsavedChanges,
  hasDraft,
  onRestoreDraft,
  onSaveDraft,
  className,
}: DraftIndicatorProps) => {
  if (!hasDraft && !hasUnsavedChanges && !lastSaved) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {hasUnsavedChanges && (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unsaved changes
        </Badge>
      )}
      
      {lastSaved && !hasUnsavedChanges && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Save className="h-3 w-3 mr-1" />
          Saved {format(lastSaved, 'HH:mm')}
        </Badge>
      )}
      
      {hasDraft && onRestoreDraft && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRestoreDraft}
          className="h-6 px-2 text-xs"
        >
          <Clock className="h-3 w-3 mr-1" />
          Restore Draft
        </Button>
      )}
      
      {onSaveDraft && hasUnsavedChanges && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          className="h-6 px-2 text-xs"
        >
          <Save className="h-3 w-3 mr-1" />
          Save Draft
        </Button>
      )}
    </div>
  );
};