'use client'

export function ReloadButton() {
  const reload = () => window.location.reload()
  return (
    <button className="mx-1 underline" onClick={reload}>
      try again.
    </button>
  )
}
