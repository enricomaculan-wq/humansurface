'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200"
    >
      Print / Save as PDF
    </button>
  )
}