namespace BookCalls.Api.Models;

/// <summary>Бронирование. endAt считает сервер как startAt + durationMinutes типа события.</summary>
public record Booking
{
    public required string Id { get; init; }
    public required string EventTypeId { get; init; }
    public required string EventTypeTitle { get; init; }
    public required DateTimeOffset StartAt { get; init; }
    public required DateTimeOffset EndAt { get; init; }
    public required string GuestName { get; init; }
    public required string GuestEmail { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}

/// <summary>Тело POST /bookings. endAt не передаётся — его вычисляет сервер.</summary>
public record CreateBookingRequest
{
    public string? EventTypeId { get; init; }
    public DateTimeOffset? StartAt { get; init; }
    public string? GuestName { get; init; }
    public string? GuestEmail { get; init; }
}

/// <summary>Ответ GET /admin/bookings.</summary>
public record BookingList(IReadOnlyList<Booking> Items);
