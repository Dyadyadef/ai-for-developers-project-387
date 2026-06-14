import type { components } from './types'

export type Schemas = components['schemas']
export type EventType = Schemas['EventType']
export type Booking = Schemas['Booking']
export type Slot = Schemas['Slot']
export type SlotsResponse = Schemas['SlotsResponse']
export type Owner = Schemas['Owner']
export type ProblemDetails = Schemas['ProblemDetails']
export type CreateBookingRequest = Schemas['CreateBookingRequest']
export type CreateEventTypeRequest = Schemas['CreateEventTypeRequest']
export type UpdateEventTypeRequest = Schemas['UpdateEventTypeRequest']

export class ApiError extends Error {
  status: number
  details: ProblemDetails

  constructor(status: number, details: ProblemDetails) {
    super(details.message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let details: ProblemDetails = {
      code: 'UNKNOWN',
      message: response.statusText || 'Неизвестная ошибка',
    }

    try {
      details = (await response.json()) as ProblemDetails
    } catch {
      // ignore parse errors
    }

    throw new ApiError(response.status, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  getOwner: () => request<Owner>('/owner'),

  listEventTypes: () => request<EventType[]>('/event-types'),

  getEventType: (eventTypeId: string) =>
    request<EventType>(`/event-types/${encodeURIComponent(eventTypeId)}`),

  listSlots: (eventTypeId: string, from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString()
    const suffix = query ? `?${query}` : ''
    return request<SlotsResponse>(
      `/event-types/${encodeURIComponent(eventTypeId)}/slots${suffix}`,
    )
  },

  createBooking: (body: CreateBookingRequest) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  listAdminEventTypes: () => request<EventType[]>('/admin/event-types'),

  createEventType: (body: CreateEventTypeRequest) =>
    request<EventType>('/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateEventType: (eventTypeId: string, body: UpdateEventTypeRequest) =>
    request<EventType>(`/admin/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteEventType: (eventTypeId: string) =>
    request<void>(`/admin/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: 'DELETE',
    }),

  listAdminBookings: (from?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    const query = params.toString()
    const suffix = query ? `?${query}` : ''
    return request<{ items: Booking[] }>(`/admin/bookings${suffix}`)
  },
}
