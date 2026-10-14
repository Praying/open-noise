/** 工具栏/列表用内联 SVG(按 macOS 风格描边) */

export function iconPlay(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>`
}

export function iconPause(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h3.5v15H7zm6.5 0H17v15h-3.5z" fill="currentColor"/></svg>`
}

export function iconPrev(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5v14L3 12zm10 0v14l-8-7z" fill="currentColor"/></svg>`
}

export function iconNext(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5v14l8-7zM3 5v14l8-7z" fill="currentColor"/></svg>`
}

export function iconVolumeLow(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" fill="currentColor"/></svg>`
}

export function iconVolumeHigh(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z" fill="currentColor"/>
    <path d="M15 8.5c1.2 1 2 2.2 2 3.5s-.8 2.5-2 3.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M17.2 6c2 1.6 3.2 3.7 3.2 6s-1.2 4.4-3.2 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </svg>`
}

export function iconTimer(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12.5" r="7.5" stroke="currentColor" stroke-width="1.7" fill="none"/>
    <path d="M12 8.5v4.5l3 2" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

export function iconGlobe(): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <ellipse cx="12" cy="12" rx="4" ry="8.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M3.5 12h17M4.5 7.5h15M4.5 16.5h15" stroke="currentColor" stroke-width="1.4" fill="none"/>
  </svg>`
}

export function iconHeart(filled: boolean): string {
  const d =
    'M12 20.5s-7.2-4.6-9.3-9C1.2 8.3 3 4.8 6.6 4.8c2.1 0 3.7 1.2 4.4 2.6.7-1.4 2.3-2.6 4.4-2.6 3.6 0 5.4 3.5 3.9 6.7-2.1 4.4-9.3 9-9.3 9z'
  return filled
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>`
}

