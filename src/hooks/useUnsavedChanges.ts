import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  shouldBlock?: boolean;
}

export const useUnsavedChanges = ({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
  shouldBlock = true,
}: UseUnsavedChangesOptions) => {
  // Block browser navigation (refresh, back button, etc.)
  useEffect(() => {
    if (!shouldBlock || !hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message, shouldBlock]);

  // For programmatic navigation blocking, we'd need to use react-router's blocker
  // This is a simplified version that alerts users
  const confirmNavigation = useCallback(() => {
    if (!hasUnsavedChanges) return true;
    return window.confirm(message);
  }, [hasUnsavedChanges, message]);

  return { confirmNavigation };
};