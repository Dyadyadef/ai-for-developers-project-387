namespace BookCalls.Api.Models;

/// <summary>
/// Формат ошибки по контракту (ProblemDetails из TypeSpec): { code, message }.
/// Это НЕ стандартный ASP.NET ProblemDetails (type/title/status/detail).
/// </summary>
public record ApiProblem(string Code, string Message);
