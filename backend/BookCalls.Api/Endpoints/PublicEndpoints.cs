using BookCalls.Api.Models;
using BookCalls.Api.Services;
using BookCalls.Api.Storage;

namespace BookCalls.Api.Endpoints;

/// <summary>Public-эндпоинты для гостей (тег "Public" в контракте).</summary>
public static class PublicEndpoints
{
    public static void MapPublicEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(string.Empty).WithTags("Public");

        group.MapGet("/owner", (InMemoryStore store) => store.Owner);

        group.MapGet("/event-types", (EventTypeService service) => service.List());

        group.MapGet("/event-types/{eventTypeId}",
            (string eventTypeId, EventTypeService service) => service.Get(eventTypeId));

        group.MapGet("/event-types/{eventTypeId}/slots",
            (string eventTypeId, DateOnly? from, DateOnly? to, SlotService service)
                => service.GetSlots(eventTypeId, from, to));

        group.MapPost("/bookings", (CreateBookingRequest body, BookingService service)
            => Results.Json(service.Create(body), statusCode: StatusCodes.Status201Created));
    }
}
