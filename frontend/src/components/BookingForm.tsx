import { useState } from 'react'
import { formatUtcDateTime } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BookingFormProps {
  selectedStartAt: string | null
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (values: { guestName: string; guestEmail: string }) => void
}

export function BookingForm({
  selectedStartAt,
  isSubmitting,
  errorMessage,
  onSubmit,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedStartAt) return
    onSubmit({ guestName, guestEmail })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <p className="text-sm font-medium">Выбранное время</p>
        <p className="text-sm text-muted-foreground">
          {selectedStartAt ? formatUtcDateTime(selectedStartAt) : 'Сначала выберите слот'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestName">Имя</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          required
          placeholder="Иван Петров"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestEmail">Email</Label>
        <Input
          id="guestEmail"
          type="email"
          value={guestEmail}
          onChange={(event) => setGuestEmail(event.target.value)}
          required
          placeholder="ivan@example.com"
        />
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={!selectedStartAt || isSubmitting} className="w-full">
        {isSubmitting ? 'Создание...' : 'Записаться'}
      </Button>
    </form>
  )
}
