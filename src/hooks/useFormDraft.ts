import { useState, useEffect, useCallback } from 'react';

interface DraftState<T> {
  data: T | null;
  lastSaved: Date | null;
  hasChanges: boolean;
}

export const useFormDraft = <T extends Record<string, any>>(
  formKey: string,
  currentValues: T,
  enabled: boolean = true
) => {
  const [draftState, setDraftState] = useState<DraftState<T>>({
    data: null,
    lastSaved: null,
    hasChanges: false,
  });

  const storageKey = `form_draft_${formKey}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraftState({
          data: parsed.data,
          lastSaved: new Date(parsed.lastSaved),
          hasChanges: false,
        });
      }
    } catch (error) {
      console.warn('Failed to load form draft:', error);
    }
  }, [formKey, enabled, storageKey]);

  // Auto-save current values
  const saveDraft = useCallback(() => {
    if (!enabled) return;
    
    try {
      const draftData = {
        data: currentValues,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setDraftState(prev => ({
        ...prev,
        lastSaved: new Date(),
        hasChanges: false,
      }));
    } catch (error) {
      console.warn('Failed to save form draft:', error);
    }
  }, [currentValues, enabled, storageKey]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled || !currentValues) return;
    
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [currentValues, saveDraft, enabled]);

  // Track if there are unsaved changes
  useEffect(() => {
    if (!enabled || !draftState.data) return;
    
    const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(draftState.data);
    setDraftState(prev => ({ ...prev, hasChanges }));
  }, [currentValues, draftState.data, enabled]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setDraftState({
        data: null,
        lastSaved: null,
        hasChanges: false,
      });
    } catch (error) {
      console.warn('Failed to clear form draft:', error);
    }
  }, [storageKey]);

  const restoreDraft = useCallback(() => {
    return draftState.data;
  }, [draftState.data]);

  return {
    draftState,
    saveDraft,
    clearDraft,
    restoreDraft,
    hasDraft: !!draftState.data,
    hasUnsavedChanges: draftState.hasChanges,
  };
};