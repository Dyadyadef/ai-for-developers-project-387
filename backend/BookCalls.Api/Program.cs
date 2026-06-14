using BookCalls.Api.Common;
using BookCalls.Api.Endpoints;
using BookCalls.Api.Models;
using BookCalls.Api.Services;
using BookCalls.Api.Storage;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// В проде/Render порт задаётся переменной окружения PORT; локально остаётся профиль launchSettings.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://+:{port}");

const string corsPolicy = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(corsPolicy, policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

// utcDateTime сериализуется как "...Z" по контракту. Web-defaults дают camelCase.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new UtcDateTimeOffsetConverter()));

// Хранилище — singleton (живёт всё время процесса), сервисы поверх него — тоже singleton.
builder.Services.AddSingleton<InMemoryStore>();
builder.Services.AddSingleton<EventTypeService>();
builder.Services.AddSingleton<SlotService>();
builder.Services.AddSingleton<BookingService>();

var app = builder.Build();

// Любая ошибка отдаётся как { code, message } с нужным HTTP-статусом.
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

    var (status, problem) = exception switch
    {
        AppException ae => (ae.StatusCode, new ApiProblem(ae.Code, ae.Message)),
        BadHttpRequestException => (StatusCodes.Status400BadRequest,
            new ApiProblem("VALIDATION_ERROR", "Некорректное тело запроса")),
        _ => (StatusCodes.Status500InternalServerError,
            new ApiProblem("INTERNAL_ERROR", "Внутренняя ошибка сервера")),
    };

    if (status >= 500 && exception is not null)
        app.Logger.LogError(exception, "Необработанная ошибка");

    context.Response.StatusCode = status;
    await context.Response.WriteAsJsonAsync(problem);
}));

// Собранный SPA (frontend/dist) кладётся в wwwroot и отдаётся с того же origin, что и API.
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors(corsPolicy);

app.MapPublicEndpoints();
app.MapAdminEndpoints();

// Неизвестные пути (клиентские маршруты React Router) отдают index.html.
app.MapFallbackToFile("index.html");

app.Run();
