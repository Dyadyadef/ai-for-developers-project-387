using BookCalls.Api.Common;
using BookCalls.Api.Models;
using BookCalls.Api.Storage;

namespace BookCalls.Api.Services;

/// <summary>
/// Генерация свободных слотов на лету (слоты не хранятся).
/// Рабочие часы 09:00–18:00 UTC, шаг сетки = durationMinutes, окно записи — 14 дней.
/// </summary>
public class SlotService(InMemoryStore store)
{
    public const int WindowDays = 14;
    private static readonly TimeOnly WorkStart = new(9, 0);
    private static readonly TimeOnly WorkEnd = new(18, 0);

    public SlotsResponse GetSlots(string eventTypeId, DateOnly? from, DateOnly? to)
    {
        var eventType = store.GetEventType(eventTypeId)
            ?? throw AppException.NotFound($"Тип события '{eventTypeId}' не найден");

        var now = DateTimeOffset.UtcNow;
        var windowLimit = now.AddDays(WindowDays);
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var maxDay = today.AddDays(WindowDays);

        // Запрошенный диапазон, обрезанный к допустимому окну [today, today+14d].
        var windowStart = from is DateOnly f && f > today ? f : today;
        var windowEnd = to is DateOnly t && t < maxDay ? t : maxDay;

        var items = new List<Slot>();

        if (windowEnd >= windowStart)
        {
            List<Booking> bookings;
            lock (store.BookingsLock)
                bookings = store.Bookings.ToList();

            var duration = TimeSpan.FromMinutes(eventType.DurationMinutes);

            for (var day = windowStart; day <= windowEnd; day = day.AddDays(1))
            {
                var cursor = new DateTimeOffset(day.ToDateTime(WorkStart), TimeSpan.Zero);
                var dayEnd = new DateTimeOffset(day.ToDateTime(WorkEnd), TimeSpan.Zero);

                while (cursor + duration <= dayEnd)
                {
                    var slotStart = cursor;
                    var slotEnd = cursor + duration;
                    cursor = slotEnd;

                    if (slotStart <= now || slotStart > windowLimit)
                        continue; // в прошлом или за пределами окна 14 дней

                    var taken = bookings.Any(b => slotStart < b.EndAt && b.StartAt < slotEnd);
                    if (taken)
                        continue; // глобально занятое время — любого типа события

                    items.Add(new Slot(slotStart, slotEnd, true));
                }
            }
        }

        return new SlotsResponse(windowStart, windowEnd, items);
    }
}
