import { useState, useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  progress?: number
  showProgress?: boolean
}

interface LoadingToastOptions extends Omit<ToastOptions, 'progress' | 'showProgress'> {
  showProgress?: boolean
}

export const useEnhancedToast = () => {
  const [loadingToasts, setLoadingToasts] = useState<Map<string, number>>(new Map())

  const success = useCallback((options: ToastOptions) => {
    return sonnerToast.success(options.title || 'Success', {
      description: options.description,
      duration: options.duration || 4000,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const error = useCallback((options: ToastOptions) => {
    return sonnerToast.error(options.title || 'Error', {
      description: options.description,
      duration: options.duration || 6000,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const warning = useCallback((options: ToastOptions) => {
    return sonnerToast.warning(options.title || 'Warning', {
      description: options.description,
      duration: options.duration || 5000,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const info = useCallback((options: ToastOptions) => {
    return sonnerToast.info(options.title || 'Info', {
      description: options.description,
      duration: options.duration || 4000,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const loading = useCallback((options: LoadingToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    if (options.showProgress) {
      setLoadingToasts(prev => new Map(prev.set(id, 0)))
    }

    return sonnerToast.loading(options.title || 'Loading...', {
      description: options.description,
      duration: Infinity,
      id,
      action: options.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const updateProgress = useCallback((toastId: string | number, progress: number) => {
    setLoadingToasts(prev => {
      const newMap = new Map(prev)
      newMap.set(toastId.toString(), progress)
      return newMap
    })
  }, [])

  const dismiss = useCallback((toastId?: string | number) => {
    if (toastId) {
      setLoadingToasts(prev => {
        const newMap = new Map(prev)
        newMap.delete(toastId.toString())
        return newMap
      })
    }
    sonnerToast.dismiss(toastId)
  }, [])

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    options: {
      loading?: string | ToastOptions
      success?: string | ((data: T) => string | ToastOptions)
      error?: string | ((error: Error) => string | ToastOptions)
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: typeof options.loading === 'string' ? options.loading : options.loading?.title || 'Loading...',
      success: (data) => {
        if (typeof options.success === 'function') {
          const result = options.success(data)
          return typeof result === 'string' ? result : (result as ToastOptions)?.title || 'Success'
        }
        return typeof options.success === 'string' ? options.success : (options.success as ToastOptions)?.title || 'Success'
      },
      error: (error) => {
        if (typeof options.error === 'function') {
          const result = options.error(error)
          return typeof result === 'string' ? result : (result as ToastOptions)?.title || 'Error'
        }
        return typeof options.error === 'string' ? options.error : (options.error as ToastOptions)?.title || 'Something went wrong'
      }
    })
  }, [])

  return {
    success,
    error,
    warning,
    info,
    loading,
    updateProgress,
    dismiss,
    promise,
    loadingToasts,
  }
}

export type { ToastOptions, LoadingToastOptions }