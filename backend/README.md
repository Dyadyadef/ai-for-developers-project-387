# BookCalls — Backend (ASP.NET, .NET 10)

Серверная часть «Календаря звонков», реализованная **от контракта** (TypeSpec →
OpenAPI 3.1 из `../typespec`). API предназначен для отдельного фронтенд-клиента
(`../frontend`).

- **Стек:** .NET 10, ASP.NET Minimal API.
- **Хранилище:** в памяти (`InMemoryStore`). Отдельная БД не нужна — **данные
  сбрасываются при перезапуске** сервиса. При старте сидируются владелец и два
  типа событий.
- **Бизнес-правила** реализованы на бэкенде: окно записи 14 дней, глобальная
  уникальность времени (одна бронь на слот для всех типов событий),
  `endAt = startAt + durationMinutes`.

## Запуск

```bash
cd backend/BookCalls.Api
dotnet run
```

Сервис поднимается на `http://localhost:5002` (профиль `Properties/launchSettings.json`).

## Эндпоинты (по контракту)

| Метод | Путь | Назначение |
|-------|------|-----------|
| GET | `/owner` | Профиль владельца (`id = "default"`) |
| GET | `/event-types` | Список типов событий |
| GET | `/event-types/{id}` | Детали типа события (404, если нет) |
| GET | `/event-types/{id}/slots?from&to` | Свободные слоты (09:00–18:00 UTC, окно 14 дней) |
| POST | `/bookings` | Создать бронь (201 / 400 / 404 / **409** при занятом слоте) |
| GET | `/admin/event-types` | Список типов |
| POST | `/admin/event-types` | Создать тип (409, если `id` занят) |
| GET | `/admin/event-types/{id}` | Детали |
| PATCH | `/admin/event-types/{id}` | Частичное обновление |
| DELETE | `/admin/event-types/{id}` | Удалить (204 / 404) |
| GET | `/admin/bookings?from` | Предстоящие встречи (sorted by `startAt` asc) |

Ошибки возвращаются в формате контракта `{ "code": ..., "message": ... }` со
статусами 400 / 404 / 409.

### Обработка занятого слота

`POST /bookings` под общим локом атомарно проверяет пересечение `[startAt, endAt)`
со всеми существующими бронями (любого типа события). При конфликте — **409**:

```json
{ "code": "SLOT_CONFLICT", "message": "Выбранное время уже занято" }
```

## Подключение фронтенда к реальному backend

Фронтенд по умолчанию ходит в mock (Prism, `localhost:4010`). Чтобы переключить
его на этот backend, задайте в `frontend/.env` цель прокси Vite:

```bash
# вариант 1 — через Vite-proxy (CORS не нужен)
VITE_API_PROXY_TARGET=http://localhost:5002

# вариант 2 — прямое обращение (CORS уже разрешён в backend)
VITE_API_BASE_URL=http://localhost:5002
```

Затем:

```bash
cd frontend && npm install && npm run dev
```

## Структура

```
BookCalls.Api/
├── Program.cs              # хост, DI, CORS, JSON (utcDateTime → "...Z"), обработчик ошибок
├── Models/                 # DTO по контракту + ApiProblem { code, message }
├── Storage/InMemoryStore   # потокобезопасное хранилище + сид
├── Services/               # EventTypeService, SlotService, BookingService (бизнес-правила)
├── Endpoints/              # PublicEndpoints, AdminEndpoints (route groups)
└── Common/                 # AppException, UtcDateTimeOffsetConverter
```
