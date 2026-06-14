namespace BookCalls.Api.Models;

/// <summary>Вычисляемый слот. В ответе клиенту возвращаются только слоты с available = true.</summary>
public record Slot(DateTimeOffset StartAt, DateTimeOffset EndAt, bool Available);

/// <summary>Ответ GET /event-types/{id}/slots: окно записи + свободные слоты.</summary>
public record SlotsResponse(DateOnly WindowStart, DateOnly WindowEnd, IReadOnlyList<Slot> Items);
