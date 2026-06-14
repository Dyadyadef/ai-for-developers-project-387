import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace BookCalls;

@error
model ProblemDetails {
  code: string;
  message: string;
}

@error
@doc("Запрос содержит некорректные данные или слот вне окна записи (14 дней).")
model ValidationError extends ProblemDetails {
  @statusCode statusCode: 400;
}

@error
@doc("Ресурс не найден.")
model NotFoundError extends ProblemDetails {
  @statusCode statusCode: 404;
}

@error
@doc("Конфликт: слот уже занят или идентификатор типа события уже существует.")
model ConflictError extends ProblemDetails {
  @statusCode statusCode: 409;
}
