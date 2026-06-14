namespace BookCalls;

@doc("Бронирование встречи гостем.")
model Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  startAt: utcDateTime;
  endAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  createdAt: utcDateTime;
}

@doc("Данные для создания бронирования.")
model CreateBookingRequest {
  eventTypeId: string;
  startAt: utcDateTime;
  guestName: string;
  guestEmail: string;
}

@doc("Список бронирований для админской страницы.")
model BookingList {
  items: Booking[];
}
