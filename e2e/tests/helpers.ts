import type { APIRequestContext } from '@playwright/test'
import { BACKEND_URL } from '../playwright.config'

export interface Slot {
  startAt: string
  endAt: string
  available: boolean
}

/**
 * Доступные слоты типа события напрямую из backend, в том же порядке (по возрастанию),
 * в каком их рендерит UI — поэтому slots[0] соответствует первой кнопке слота на странице.
 */
export async function fetchSlots(
  request: APIRequestContext,
  eventTypeId: string,
): Promise<Slot[]> {
  const response = await request.get(
    `${BACKEND_URL}/event-types/${encodeURIComponent(eventTypeId)}/slots`,
  )
  if (!response.ok()) {
    throw new Error(`Не удалось получить слоты: ${response.status()} ${await response.text()}`)
  }
  const body = (await response.json()) as { items: Slot[] }
  return body.items.filter((s) => s.available)
}

/** Бронирует слот напрямую через API (имитация «другого гостя»). */
export async function bookViaApi(
  request: APIRequestContext,
  params: { eventTypeId: string; startAt: string; guestName: string; guestEmail: string },
): Promise<void> {
  const response = await request.post(`${BACKEND_URL}/bookings`, {
    data: params,
  })
  if (response.status() !== 201) {
    throw new Error(`Ожидали 201, получили ${response.status()}: ${await response.text()}`)
  }
}

let guestCounter = 0

/** Уникальные данные гостя в пределах прогона (без Date.now()/Math.random()). */
export function uniqueGuest(label: string): { name: string; email: string } {
  guestCounter += 1
  const tag = `${label}-${guestCounter}`
  return {
    name: `Гость ${tag}`,
    email: `guest-${tag}@example.com`,
  }
}
