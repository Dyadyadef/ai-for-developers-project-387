import { useEffect, useState } from 'react'
import type { CreateEventTypeRequest, EventType, UpdateEventTypeRequest } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface EventTypeFormProps {
  mode: 'create' | 'edit'
  initial?: EventType
  isSubmitting: boolean
  onSubmit: (values: CreateEventTypeRequest | UpdateEventTypeRequest) => void
  onCancel: () => void
}

export function EventTypeForm({
  mode,
  initial,
  isSubmitting,
  onSubmit,
  onCancel,
}: EventTypeFormProps) {
  const [id, setId] = useState(initial?.id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [durationMinutes, setDurationMinutes] = useState(
    String(initial?.durationMinutes ?? 30),
  )

  useEffect(() => {
    if (initial) {
      setId(initial.id)
      setTitle(initial.title)
      setDescription(initial.description)
      setDurationMinutes(String(initial.durationMinutes))
    }
  }, [initial])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const duration = Number(durationMinutes)

    if (mode === 'create') {
      onSubmit({ id, title, description, durationMinutes: duration })
      return
    }

    onSubmit({ title, description, durationMinutes: duration })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'create' ? (
        <div className="space-y-2">
          <Label htmlFor="eventTypeId">ID (slug)</Label>
          <Input
            id="eventTypeId"
            value={id}
            onChange={(event) => setId(event.target.value)}
            required
            placeholder="consultation-30"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="eventTypeTitle">Название</Label>
        <Input
          id="eventTypeTitle"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventTypeDescription">Описание</Label>
        <Textarea
          id="eventTypeDescription"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventTypeDuration">Длительность (мин, 5–480)</Label>
        <Input
          id="eventTypeDuration"
          type="number"
          min={5}
          max={480}
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
