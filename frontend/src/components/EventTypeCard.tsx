import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { EventType } from '@/api/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface EventTypeCardProps {
  eventType: EventType
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Card className="flex flex-col text-left">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{eventType.title}</CardTitle>
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {eventType.durationMinutes} мин
          </Badge>
        </div>
        <CardDescription>{eventType.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/book/${eventType.id}`}>Выбрать время</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
