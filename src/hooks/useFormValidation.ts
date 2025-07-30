import { useState, useEffect } from 'react';
import { z } from 'zod';

interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  isValidating: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  values: T,
  debounceMs: number = 300
) => {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    errors: {},
    isValidating: false,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setValidation(prev => ({ ...prev, isValidating: true }));
      
      try {
        schema.parse(values);
        setValidation({
          isValid: true,
          errors: {},
          isValidating: false,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach(err => {
            if (err.path.length > 0) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setValidation({
            isValid: false,
            errors,
            isValidating: false,
          });
        }
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [values, schema, debounceMs]);

  return validation;
};

// ABN validation helper
export const validateABN = (abn: string): boolean => {
  if (!abn) return true; // Optional field
  
  const cleaned = abn.replace(/\s/g, '');
  if (!/^\d{11}$/.test(cleaned)) return false;
  
  // ABN check digit algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  for (let i = 0; i < 11; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  return sum % 89 === 0;
};

// Phone validation helper
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  
  // Australian phone number pattern
  const pattern = /^(\+61|0)[2-478][\d\s-]{8,}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};