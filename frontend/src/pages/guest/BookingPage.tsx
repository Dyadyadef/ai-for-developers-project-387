import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { ApiError, type Booking } from '@/api/client'
import { useCreateBooking, useEventType, useSlots } from '@/api/hooks'
import { BookingForm } from '@/components/BookingForm'
import { SlotPicker } from '@/components/SlotPicker'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUtcDateTime } from '@/lib/dates'

export function BookingPage() {
  const { eventTypeId = '' } = useParams()
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)

  const eventTypeQuery = useEventType(eventTypeId)
  const slotsQuery = useSlots(eventTypeId)
  const createBooking = useCreateBooking(eventTypeId)

  const handleSubmit = async (values: { guestName: string; guestEmail: string }) => {
    if (!selectedStartAt) return

    setFormError(null)

    try {
      const booking = await createBooking.mutateAsync({
        eventTypeId,
        startAt: selectedStartAt,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
      })
      setCreatedBooking(booking)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setFormError('Это время уже занято. Выберите другой слот.')
          void slotsQuery.refetch()
          return
        }
        setFormError(error.details.message)
        return
      }
      setFormError('Не удалось создать бронирование')
    }
  }

  if (eventTypeQuery.isLoading || slotsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (eventTypeQuery.isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {eventTypeQuery.error instanceof ApiError && eventTypeQuery.error.status === 404
              ? 'Тип события не найден'
              : eventTypeQuery.error.message}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/">Назад к типам</Link>
        </Button>
      </div>
    )
  }

  const eventType = eventTypeQuery.data
  const slots = slotsQuery.data?.items ?? []

  if (createdBooking) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Бронирование создано</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {eventType?.title}: {formatUtcDateTime(createdBooking.startAt)} —{' '}
            {formatUtcDateTime(createdBooking.endAt)}
          </p>
        </div>
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{eventType?.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{eventType?.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Окно записи: {slotsQuery.data?.windowStart} — {slotsQuery.data?.windowEnd} (UTC)
          </p>
        </div>
      </div>

      {slotsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Не удалось загрузить слоты</AlertTitle>
          <AlertDescription>{slotsQuery.error.message}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-4 text-sm font-medium">Свободные слоты (UTC)</h2>
            <SlotPicker
              slots={slots}
              selectedStartAt={selectedStartAt}
              onSelect={setSelectedStartAt}
            />
          </section>

          <BookingForm
            selectedStartAt={selectedStartAt}
            isSubmitting={createBooking.isPending}
            errorMessage={formError}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  )
}
