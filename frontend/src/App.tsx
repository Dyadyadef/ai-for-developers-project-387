import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout, AppLayout } from '@/components/AppLayout'
import { BookingsAdminPage } from '@/pages/admin/BookingsAdminPage'
import { EventTypesAdminPage } from '@/pages/admin/EventTypesAdminPage'
import { BookingPage } from '@/pages/guest/BookingPage'
import { EventTypesPage } from '@/pages/guest/EventTypesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<EventTypesPage />} />
        <Route path="book/:eventTypeId" element={<BookingPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="event-types" replace />} />
          <Route path="event-types" element={<EventTypesAdminPage />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
