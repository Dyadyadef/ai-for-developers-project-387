import { useAdminBookings } from '@/api/hooks'
import { BookingsTable } from '@/components/BookingsTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function BookingsAdminPage() {
  const { data, isLoading, isError, error } = useAdminBookings()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Предстоящие встречи</h1>
        <p className="text-sm text-muted-foreground">
          Все бронирования всех типов событий в одном списке.
        </p>
      </div>
      <BookingsTable bookings={data?.items ?? []} />
    </div>
  )
}
