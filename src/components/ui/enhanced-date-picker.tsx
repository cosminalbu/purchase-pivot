import * as React from "react";
import { format, addDays, startOfTomorrow, startOfToday } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface EnhancedDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  showPresets?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const datePresets = [
  { label: "Today", getValue: () => startOfToday() },
  { label: "Tomorrow", getValue: () => startOfTomorrow() },
  { label: "Next week", getValue: () => addDays(new Date(), 7) },
  { label: "Next month", getValue: () => addDays(new Date(), 30) },
];

export const EnhancedDatePicker = ({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  showPresets = true,
  minDate,
  maxDate,
  className,
}: EnhancedDatePickerProps) => {
  const [open, setOpen] = React.useState(false);

  const handlePresetClick = (getValue: () => Date) => {
    const date = getValue();
    onChange(date);
    setOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabled?.(date) || false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          {showPresets && (
            <>
              <Separator orientation="vertical" className="h-auto" />
              <div className="flex flex-col gap-1 p-3 min-w-[120px]">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Quick select
                </div>
                {datePresets.map((preset) => {
                  const presetDate = preset.getValue();
                  const isDisabled = isDateDisabled(presetDate);
                  
                  return (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8 px-2"
                      disabled={isDisabled}
                      onClick={() => handlePresetClick(preset.getValue)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};