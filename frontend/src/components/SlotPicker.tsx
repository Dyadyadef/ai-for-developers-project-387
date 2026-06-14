import type { Slot } from '@/api/client'
import { formatLocalDate, formatLocalTime, groupSlotsByDate, getUserTimezone } from '@/lib/dates'
import { Button } from '@/components/ui/button'

interface SlotPickerProps {
  slots: Slot[]
  selectedStartAt: string | null
  onSelect: (startAt: string) => void
}

export function SlotPicker({ slots, selectedStartAt, onSelect }: SlotPickerProps) {
  const grouped = groupSlotsByDate(slots)
  const timezone = getUserTimezone()

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Нет свободных слотов в ближайшие 14 дней.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([dateKey, daySlots]) => (
        <div key={dateKey} className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {formatLocalDate(daySlots[0].startAt)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const isSelected = selectedStartAt === slot.startAt
              return (
                <Button
                  key={slot.startAt}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelect(slot.startAt)}
                >
                  {formatLocalTime(slot.startAt)}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Время указано в вашем часовом поясе: {timezone}
      </p>
    </div>
  )
}
