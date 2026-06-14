namespace BookCalls.Api.Models;

/// <summary>Тип события, настраиваемый владельцем. Длительность задаёт размер слота.</summary>
public record EventType
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required int DurationMinutes { get; init; }
}

/// <summary>Тело POST /admin/event-types. Поля nullable, чтобы валидировать вручную и вернуть {code,message}.</summary>
public record CreateEventTypeRequest
{
    public string? Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public int? DurationMinutes { get; init; }
}

/// <summary>Тело PATCH /admin/event-types/{id}. Все поля опциональны.</summary>
public record UpdateEventTypeRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public int? DurationMinutes { get; init; }
}
