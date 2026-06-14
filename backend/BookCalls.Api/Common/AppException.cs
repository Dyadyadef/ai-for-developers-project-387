namespace BookCalls.Api.Common;

/// <summary>
/// Доменная ошибка, переводимая глобальным обработчиком в HTTP-ответ { code, message }.
/// </summary>
public class AppException : Exception
{
    public int StatusCode { get; }
    public string Code { get; }

    public AppException(int statusCode, string code, string message) : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }

    public static AppException Validation(string message, string code = "VALIDATION_ERROR")
        => new(StatusCodes.Status400BadRequest, code, message);

    public static AppException NotFound(string message, string code = "NOT_FOUND")
        => new(StatusCodes.Status404NotFound, code, message);

    public static AppException Conflict(string message, string code = "SLOT_CONFLICT")
        => new(StatusCodes.Status409Conflict, code, message);
}
