import { useEventTypes } from '@/api/hooks'
import { EventTypeCard } from '@/components/EventTypeCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function EventTypesPage() {
  const { data, isLoading, isError, error } = useEventTypes()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  const eventTypes = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Выберите тип встречи</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Доступные виды брони на ближайшие 14 дней.
        </p>
      </div>

      {eventTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Типы событий пока не созданы.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {eventTypes.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} />
          ))}
        </div>
      )}
    </div>
  )
}
