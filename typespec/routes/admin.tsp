import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace BookCalls;

@tag("Admin")
@route("/admin/event-types")
interface AdminEventTypes {
  @doc("Список всех типов событий владельца.")
  @get
  list(): EventType[];

  @doc("Создаёт новый тип события. Возвращает 409, если id уже занят.")
  @post
  create(@body body: CreateEventTypeRequest):
    | {
        @statusCode statusCode: 201;
        @body body: EventType;
      }
    | ConflictError;

  @doc("Возвращает тип события по идентификатору.")
  @get
  @route("{eventTypeId}")
  get(@path eventTypeId: string): EventType | NotFoundError;

  @doc("Частично обновляет тип события.")
  @patch
  @route("{eventTypeId}")
  update(
    @path eventTypeId: string,
    @body body: UpdateEventTypeRequest,
  ): EventType | NotFoundError;

  @doc("Удаляет тип события.")
  @delete
  @route("{eventTypeId}")
  delete(@path eventTypeId: string):
    | {
        @statusCode statusCode: 204;
      }
    | NotFoundError;
}

@tag("Admin")
@route("/admin/bookings")
interface AdminBookings {
  @doc("""
    Список предстоящих встреч всех типов событий в одном списке.

    По умолчанию возвращает бронирования с startAt >= now(), отсортированные по startAt asc.
    Параметр from позволяет задать нижнюю границу фильтрации.
    """)
  @get
  list(
    @query
    @doc("Нижняя граница startAt (по умолчанию — текущее время).")
    from?: utcDateTime,
  ): BookingList;
}
