namespace BookCalls;

@doc("Тип события, доступный для бронирования.")
model EventType {
  id: string;
  title: string;
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@doc("Данные для создания типа события.")
model CreateEventTypeRequest {
  id: string;
  title: string;
  description: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes: int32;
}

@doc("Данные для частичного обновления типа события.")
model UpdateEventTypeRequest {
  title?: string;
  description?: string;

  @minValue(5)
  @maxValue(480)
  durationMinutes?: int32;
}
