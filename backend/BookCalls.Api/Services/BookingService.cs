using BookCalls.Api.Common;
using BookCalls.Api.Models;
using BookCalls.Api.Storage;

namespace BookCalls.Api.Services;

/// <summary>
/// Создание брони и список предстоящих встреч.
/// Главное бизнес-правило: на одно время — одна запись глобально (409 при конфликте).
/// </summary>
public class BookingService(InMemoryStore store)
{
    private int _counter;

    public Booking Create(CreateBookingRequest req)
    {
        var eventTypeId = (req.EventTypeId ?? string.Empty).Trim();
        var guestName = (req.GuestName ?? string.Empty).Trim();
        var guestEmail = (req.GuestEmail ?? string.Empty).Trim();

        if (eventTypeId.Length == 0) throw AppException.Validation("Поле 'eventTypeId' обязательно");
        if (req.StartAt is not DateTimeOffset rawStart) throw AppException.Validation("Поле 'startAt' обязательно");
        if (guestName.Length == 0) throw AppException.Validation("Поле 'guestName' обязательно");
        if (!IsValidEmail(guestEmail)) throw AppException.Validation("Поле 'guestEmail' некорректно");

        var eventType = store.GetEventType(eventTypeId)
            ?? throw AppException.NotFound($"Тип события '{eventTypeId}' не найден");

        var startAt = rawStart.ToUniversalTime();
        var endAt = startAt.AddMinutes(eventType.DurationMinutes);

        var now = DateTimeOffset.UtcNow;
        if (startAt <= now)
            throw AppException.Validation("Время бронирования уже прошло");
        if (startAt > now.AddDays(SlotService.WindowDays))
            throw AppException.Validation("Слот вне окна записи (14 дней)");

        // Атомарно: проверка глобального конфликта + вставка под общим локом.
        lock (store.BookingsLock)
        {
            var conflict = store.Bookings.Any(b => startAt < b.EndAt && b.StartAt < endAt);
            if (conflict)
                throw AppException.Conflict("Выбранное время уже занято", "SLOT_CONFLICT");

            var booking = new Booking
            {
                Id = $"bk_{Interlocked.Increment(ref _counter):D4}",
                EventTypeId = eventType.Id,
                EventTypeTitle = eventType.Title,
                StartAt = startAt,
                EndAt = endAt,
                GuestName = guestName,
                GuestEmail = guestEmail,
                CreatedAt = now,
            };
            store.Bookings.Add(booking);
            return booking;
        }
    }

    public BookingList ListUpcoming(DateTimeOffset? from)
    {
        var threshold = (from ?? DateTimeOffset.UtcNow).ToUniversalTime();

        List<Booking> snapshot;
        lock (store.BookingsLock)
            snapshot = store.Bookings.ToList();

        var items = snapshot
            .Where(b => b.StartAt >= threshold)
            .OrderBy(b => b.StartAt)
            .ToList();

        return new BookingList(items);
    }

    /// <summary>Лёгкая проверка email: непустой local-part, '@' и доменная точка после него.</summary>
    private static bool IsValidEmail(string email)
    {
        var at = email.IndexOf('@');
        return at > 0 && at < email.Length - 1 && email.IndexOf('.', at) > at;
    }
}
