import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type CreateBookingRequest,
  type CreateEventTypeRequest,
  type UpdateEventTypeRequest,
} from './client'

export const queryKeys = {
  owner: ['owner'] as const,
  eventTypes: ['event-types'] as const,
  eventType: (id: string) => ['event-types', id] as const,
  slots: (id: string) => ['slots', id] as const,
  adminEventTypes: ['admin', 'event-types'] as const,
  adminBookings: (from?: string) => ['admin', 'bookings', from ?? 'default'] as const,
}

export function useOwner() {
  return useQuery({
    queryKey: queryKeys.owner,
    queryFn: api.getOwner,
  })
}

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.eventTypes,
    queryFn: api.listEventTypes,
  })
}

export function useEventType(eventTypeId: string) {
  return useQuery({
    queryKey: queryKeys.eventType(eventTypeId),
    queryFn: () => api.getEventType(eventTypeId),
    enabled: Boolean(eventTypeId),
  })
}

export function useSlots(eventTypeId: string) {
  return useQuery({
    queryKey: queryKeys.slots(eventTypeId),
    queryFn: () => api.listSlots(eventTypeId),
    enabled: Boolean(eventTypeId),
  })
}

export function useCreateBooking(eventTypeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateBookingRequest) => api.createBooking(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.slots(eventTypeId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminBookings() })
    },
  })
}

export function useAdminEventTypes() {
  return useQuery({
    queryKey: queryKeys.adminEventTypes,
    queryFn: api.listAdminEventTypes,
  })
}

export function useCreateEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateEventTypeRequest) => api.createEventType(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminEventTypes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
    },
  })
}

export function useUpdateEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventTypeId,
      body,
    }: {
      eventTypeId: string
      body: UpdateEventTypeRequest
    }) => api.updateEventType(eventTypeId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminEventTypes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.eventType(variables.eventTypeId),
      })
    },
  })
}

export function useDeleteEventType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventTypeId: string) => api.deleteEventType(eventTypeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminEventTypes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
    },
  })
}

export function useAdminBookings(from?: string) {
  return useQuery({
    queryKey: queryKeys.adminBookings(from),
    queryFn: () => api.listAdminBookings(from),
  })
}
