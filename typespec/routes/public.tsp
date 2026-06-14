import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace BookCalls;

@tag("Public")
@route("/owner")
interface OwnerResource {
  @doc("Возвращает профиль единственного владельца календаря.")
  @get
  get(): Owner;
}

@tag("Public")
@route("/event-types")
interface PublicEventTypes {
  @doc("Список типов событий для страницы выбора вида брони.")
  @get
  list(): EventType[];

  @doc("Детали типа события по идентификатору.")
  @get
  @route("{eventTypeId}")
  get(@path eventTypeId: string): EventType | NotFoundError;

  @doc("""
    Свободные слоты для выбранного типа события.

    Окно записи по умолчанию: 14 дней от текущей даты.
    Параметры from/to позволяют сузить диапазон внутри этого окна.
    В ответе возвращаются только слоты с available=true.
    Слоты генерируются по рабочим часам 09:00–18:00 UTC с шагом durationMinutes.
    На одно время нельзя создать две записи, даже разных типов событий.
    """)
  @get
  @route("{eventTypeId}/slots")
  listSlots(
    @path eventTypeId: string,
    @query
    @doc("Начало диапазона (по умолчанию — текущая дата).")
    from?: plainDate,
    @query
    @doc("Конец диапазона (по умолчанию — текущая дата + 14 дней).")
    to?: plainDate,
  ): SlotsResponse | NotFoundError;
}

@tag("Public")
@route("/bookings")
interface PublicBookings {
  @doc("""
    Создаёт бронирование на выбранный слот.

    endAt вычисляется как startAt + durationMinutes типа события.
    startAt должен попадать в окно записи (14 дней от текущей даты).
    Возвращает 409, если интервал пересекается с существующим бронированием любого типа.
    """)
  @post
  create(@body body: CreateBookingRequest):
    | {
        @statusCode statusCode: 201;
        @body body: Booking;
      }
    | ValidationError
    | NotFoundError
    | ConflictError;
}
