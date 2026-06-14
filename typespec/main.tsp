import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "./models/common.tsp";
import "./models/owner.tsp";
import "./models/event-type.tsp";
import "./models/slot.tsp";
import "./models/booking.tsp";
import "./routes/public.tsp";
import "./routes/admin.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@doc("""
  API сервиса бронирования встреч (упрощённый аналог Cal.com).

  Две роли без регистрации и авторизации:
  - владелец календаря (единственный профиль default) — admin-эндпоинты;
  - гость — публичные эндпоинты для просмотра типов событий и бронирования слотов.

  Окно записи: 14 дней от текущей даты.
  Глобальная занятость: на одно время — одна запись независимо от типа события.
  """)
@service(#{ title: "Календарь звонков" })
@info(#{ version: "0.1.0" })
@server("https://bookcalls_hexlet_example.ru", "Production")
namespace BookCalls;
