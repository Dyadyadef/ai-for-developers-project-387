const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

export function formatUtcDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatUtcTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatUtcDateTime(iso: string): string {
  return `${dateTimeFormatter.format(new Date(iso))} UTC`
}

export function groupSlotsByDate<T extends { startAt: string }>(
  slots: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const slot of slots) {
    const dateKey = slot.startAt.slice(0, 10)
    const existing = groups.get(dateKey) ?? []
    existing.push(slot)
    groups.set(dateKey, existing)
  }

  return groups
}
