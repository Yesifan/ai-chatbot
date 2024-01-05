export function TailwindPallette() {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-1 left-24 z-50 overflow-hidden rounded">
      <div className="flex gap-1 bg-primary p-1">
        <div className="h-3 w-3 rounded bg-background" />
        <div className="h-3 w-3 rounded bg-primary-foreground" />
        <div className="h-3 w-3 rounded bg-muted" />
        <div className="h-3 w-3 rounded bg-secondary" />
        <div className="h-3 w-3 rounded bg-popover" />
        <div className="h-3 w-3 rounded bg-card" />
        <div className="h-3 w-3 rounded bg-accent" />
        <div className="h-3 w-3 rounded bg-destructive" />
        <div className="h-3 w-3 rounded bg-border" />
        <div className="h-3 w-3 rounded bg-input" />
        <div className="h-3 w-3 rounded bg-ring" />
      </div>
      <div className="flex gap-1 bg-secondary p-1">
        <div className="h-3 w-3 rounded bg-foreground" />
        <div className="h-3 w-3 rounded bg-primary" />
        <div className="h-3 w-3 rounded bg-muted-foreground" />
        <div className="h-3 w-3 rounded bg-secondary-foreground" />
        <div className="h-3 w-3 rounded bg-popover-foreground" />
        <div className="h-3 w-3 rounded bg-card-foreground" />
        <div className="h-3 w-3 rounded bg-accent-foreground" />
        <div className="h-3 w-3 rounded bg-destructive-foreground" />
        <div className="h-3 w-3 rounded bg-theme" />
        <div className="h-3 w-3 rounded bg-warning" />
      </div>
    </div>
  )
}
