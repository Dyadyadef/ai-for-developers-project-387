using System.Collections.Concurrent;
using BookCalls.Api.Models;

namespace BookCalls.Api.Storage;

/// <summary>
/// Потокобезопасное хранилище в памяти. Данные сбрасываются при перезапуске —
/// отдельная БД не нужна (требование задания). Сидирует владельца и пару типов событий.
/// </summary>
public class InMemoryStore
{
    public Owner Owner { get; } = new("default", "Андрей Зубарев");

    private readonly ConcurrentDictionary<string, EventType> _eventTypes = new();
    private readonly List<Booking> _bookings = new();

    /// <summary>
    /// Лок для операций над списком броней. Создание брони — это атомарная
    /// «проверка конфликта + вставка», иначе две параллельные записи могут занять один слот.
    /// </summary>
    public object BookingsLock { get; } = new();

    /// <summary>Живой список броней. Доступ только под <see cref="BookingsLock"/>.</summary>
    internal List<Booking> Bookings => _bookings;

    public InMemoryStore() => Seed();

    private void Seed()
    {
        EventType[] seed =
        [
            new() { Id = "consultation-30", Title = "Консультация 30 мин", Description = "Разбор вашего проекта один на один", DurationMinutes = 30 },
            new() { Id = "quick-call-15", Title = "Быстрый звонок 15 мин", Description = "Короткий созвон по конкретному вопросу", DurationMinutes = 15 },
        ];
        foreach (var et in seed)
            _eventTypes[et.Id] = et;
    }

    // --- Типы событий ---
    public IReadOnlyList<EventType> ListEventTypes() => _eventTypes.Values.OrderBy(e => e.Title).ToList();

    public EventType? GetEventType(string id) => _eventTypes.GetValueOrDefault(id);

    public bool TryAddEventType(EventType eventType) => _eventTypes.TryAdd(eventType.Id, eventType);

    public void UpsertEventType(EventType eventType) => _eventTypes[eventType.Id] = eventType;

    public bool RemoveEventType(string id) => _eventTypes.TryRemove(id, out _);
}
