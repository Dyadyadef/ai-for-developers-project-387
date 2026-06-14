import type { Booking } from '@/api/client'
import { formatLocalDateTime } from '@/lib/dates'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BookingsTableProps {
  bookings: Booking[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет предстоящих встреч.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Дата и время</TableHead>
          <TableHead>Тип</TableHead>
          <TableHead>Гость</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{formatLocalDateTime(booking.startAt)}</TableCell>
            <TableCell>{booking.eventTypeTitle}</TableCell>
            <TableCell>{booking.guestName}</TableCell>
            <TableCell>{booking.guestEmail}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
