using BookCalls.Api.Models;
using BookCalls.Api.Services;

namespace BookCalls.Api.Endpoints;

/// <summary>Admin-эндпоинты владельца (тег "Admin"). Авторизация вне scope контракта.</summary>
public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/admin").WithTags("Admin");

        group.MapGet("/event-types", (EventTypeService service) => service.List());

        group.MapPost("/event-types", (CreateEventTypeRequest body, EventTypeService service)
            => Results.Json(service.Create(body), statusCode: StatusCodes.Status201Created));

        group.MapGet("/event-types/{eventTypeId}",
            (string eventTypeId, EventTypeService service) => service.Get(eventTypeId));

        group.MapPatch("/event-types/{eventTypeId}",
            (string eventTypeId, UpdateEventTypeRequest body, EventTypeService service)
                => service.Update(eventTypeId, body));

        group.MapDelete("/event-types/{eventTypeId}", (string eventTypeId, EventTypeService service) =>
        {
            service.Delete(eventTypeId);
            return Results.NoContent();
        });

        group.MapGet("/bookings", (DateTimeOffset? from, BookingService service) => service.ListUpcoming(from));
    }
}
