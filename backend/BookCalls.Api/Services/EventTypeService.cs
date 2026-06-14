using BookCalls.Api.Common;
using BookCalls.Api.Models;
using BookCalls.Api.Storage;

namespace BookCalls.Api.Services;

/// <summary>CRUD типов событий с валидацией по контракту (durationMinutes 5–480, уникальный id).</summary>
public class EventTypeService(InMemoryStore store)
{
    private const int MinDuration = 5;
    private const int MaxDuration = 480;

    public IReadOnlyList<EventType> List() => store.ListEventTypes();

    public EventType Get(string id) =>
        store.GetEventType(id) ?? throw AppException.NotFound($"Тип события '{id}' не найден");

    public EventType Create(CreateEventTypeRequest req)
    {
        var id = (req.Id ?? string.Empty).Trim();
        var title = (req.Title ?? string.Empty).Trim();

        if (id.Length == 0) throw AppException.Validation("Поле 'id' обязательно");
        if (title.Length == 0) throw AppException.Validation("Поле 'title' обязательно");
        if (req.DurationMinutes is not int duration)
            throw AppException.Validation("Поле 'durationMinutes' обязательно");
        ValidateDuration(duration);

        var eventType = new EventType
        {
            Id = id,
            Title = title,
            Description = req.Description ?? string.Empty,
            DurationMinutes = duration,
        };

        if (!store.TryAddEventType(eventType))
            throw AppException.Conflict($"Тип события с id '{id}' уже существует", "EVENT_TYPE_EXISTS");

        return eventType;
    }

    public EventType Update(string id, UpdateEventTypeRequest req)
    {
        var existing = Get(id);

        var duration = existing.DurationMinutes;
        if (req.DurationMinutes is int d)
        {
            ValidateDuration(d);
            duration = d;
        }

        var updated = existing with
        {
            Title = req.Title is null ? existing.Title : req.Title.Trim(),
            Description = req.Description ?? existing.Description,
            DurationMinutes = duration,
        };

        store.UpsertEventType(updated);
        return updated;
    }

    public void Delete(string id)
    {
        if (!store.RemoveEventType(id))
            throw AppException.NotFound($"Тип события '{id}' не найден");
    }

    private static void ValidateDuration(int duration)
    {
        if (duration < MinDuration || duration > MaxDuration)
            throw AppException.Validation($"Поле 'durationMinutes' должно быть в диапазоне {MinDuration}–{MaxDuration}");
    }
}
