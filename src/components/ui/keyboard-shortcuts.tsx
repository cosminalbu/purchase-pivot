import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  description: string
  category: 'navigation' | 'actions' | 'general'
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'Ctrl+K / ⌘K', description: 'Open command palette', category: 'general' },
  { key: 'Ctrl+N / ⌘N', description: 'Create new purchase order', category: 'actions' },
  { key: 'Ctrl+Shift+S / ⌘⇧S', description: 'Add new supplier', category: 'actions' },
  { key: 'Ctrl+/ / ⌘/', description: 'Show keyboard shortcuts', category: 'general' },
  { key: 'Escape', description: 'Close dialogs or cancel actions', category: 'general' },
  { key: 'Enter', description: 'Confirm actions', category: 'general' },
  { key: '1-5', description: 'Navigate to dashboard sections', category: 'navigation' },
  { key: 'Ctrl+S / ⌘S', description: 'Save current form', category: 'actions' },
]

const categoryColors = {
  navigation: 'default',
  actions: 'secondary',
  general: 'outline',
} as const

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const categorizedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant={categoryColors[shortcut.category]} className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useKeyboardShortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show shortcuts dialog
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setShowShortcuts(true)
        return
      }

      // Global escape handler
      if (event.key === 'Escape') {
        setShowShortcuts(false)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    showShortcuts,
    setShowShortcuts,
  }
}