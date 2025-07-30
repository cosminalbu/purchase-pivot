import * as React from "react";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EnhancedFormFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  validation?: {
    isValid: boolean;
    isValidating: boolean;
    error?: string;
  };
  children?: React.ReactNode;
}

export const EnhancedFormField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  validation,
  children,
}: EnhancedFormFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className={cn(fieldState.error && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <div className="relative">
            <FormControl>
              {children || (
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  className={cn(
                    "pr-8",
                    fieldState.error && "border-destructive",
                    validation?.isValid && field.value && "border-green-500"
                  )}
                />
              )}
            </FormControl>
            
            {/* Validation Status Icon */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {validation?.isValidating && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!validation?.isValidating && validation?.isValid && field.value && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {!validation?.isValidating && validation?.error && (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
          
          {/* Error Message */}
          {(fieldState.error || validation?.error) && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error?.message || validation?.error}
            </p>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};