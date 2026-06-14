const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatLocalDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatLocalTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

export function formatLocalDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function groupSlotsByDate<T extends { startAt: string }>(
  slots: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const slot of slots) {
    const date = new Date(slot.startAt)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const existing = groups.get(dateKey) ?? []
    existing.push(slot)
    groups.set(dateKey, existing)
  }

  return groups
}
