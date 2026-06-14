namespace BookCalls;

@doc("Вычисляемый временной слот для бронирования.")
model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;

  @doc("true, если слот свободен и попадает в окно записи.")
  available: boolean;
}

@doc("Список слотов с границами окна записи.")
model SlotsResponse {
  @doc("Окно записи: 14 дней от текущей даты.")
  windowStart: plainDate;

  windowEnd: plainDate;
  items: Slot[];
}
