import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ApiError, type CreateEventTypeRequest, type EventType, type UpdateEventTypeRequest } from '@/api/client'
import {
  useAdminEventTypes,
  useCreateEventType,
  useDeleteEventType,
  useUpdateEventType,
} from '@/api/hooks'
import { EventTypeForm } from '@/components/EventTypeForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function EventTypesAdminPage() {
  const { data, isLoading, isError, error } = useAdminEventTypes()
  const createMutation = useCreateEventType()
  const updateMutation = useUpdateEventType()
  const deleteMutation = useDeleteEventType()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EventType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null)

  const handleCreate = async (values: CreateEventTypeRequest | UpdateEventTypeRequest) => {
    try {
      await createMutation.mutateAsync(values as CreateEventTypeRequest)
      setCreateOpen(false)
      toast.success('Тип события создан')
    } catch (mutationError) {
      const message =
        mutationError instanceof ApiError && mutationError.status === 409
          ? 'Тип с таким ID уже существует'
          : mutationError instanceof Error
            ? mutationError.message
            : 'Ошибка создания'
      toast.error(message)
    }
  }

  const handleUpdate = async (values: CreateEventTypeRequest | UpdateEventTypeRequest) => {
    if (!editTarget) return

    try {
      await updateMutation.mutateAsync({
        eventTypeId: editTarget.id,
        body: values as UpdateEventTypeRequest,
      })
      setEditTarget(null)
      toast.success('Тип события обновлён')
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Ошибка обновления')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Тип события удалён')
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Ошибка удаления')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
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

  const eventTypes = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Типы событий</h1>
          <p className="text-sm text-muted-foreground">Управление видами брони для гостей.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Создать
        </Button>
      </div>

      {eventTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Типы событий пока не созданы.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Длительность</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes.map((eventType) => (
              <TableRow key={eventType.id}>
                <TableCell className="font-mono text-xs">{eventType.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{eventType.title}</div>
                  <div className="text-xs text-muted-foreground">{eventType.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{eventType.durationMinutes} мин</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditTarget(eventType)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(eventType)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый тип события</DialogTitle>
            <DialogDescription>Задайте id, название, описание и длительность.</DialogDescription>
          </DialogHeader>
          <EventTypeForm
            mode="create"
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование типа</DialogTitle>
          </DialogHeader>
          {editTarget ? (
            <EventTypeForm
              mode="edit"
              initial={editTarget}
              isSubmitting={updateMutation.isPending}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить тип события?</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `Будет удалён «${deleteTarget.title}» (${deleteTarget.id}).` : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
