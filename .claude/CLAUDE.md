# Календарь звонков (BookCalls)

Упрощённый аналог Cal.com для бронирования встреч. В репозитории сейчас — **API-контракт на TypeSpec**; backend и frontend строятся поверх сгенерированной OpenAPI-спецификации.

## Домен

Две роли **без регистрации и авторизации**:

- **Владелец** — один заранее заданный профиль (`id = "default"`). Управляет типами событий и смотрит предстоящие встречи в admin-части.
- **Гость** — без аккаунта выбирает тип события, свободный слот и создаёт бронирование (имя + email).

**Ключевые правила:** окно записи — 14 дней от текущей даты; на одно время — одна запись глобально, даже для разных типов событий.

## TypeSpec

Контракт в `typespec/`, namespace `BookCalls`. Компиляция: `cd typespec && npm run compile` → OpenAPI 3.1 в `tsp-output/schema/openapi.yaml`.

- **Public:** `/owner`, `/event-types`, `/event-types/{id}/slots`, `POST /bookings`
- **Admin:** CRUD `/admin/event-types`, список `/admin/bookings`

Подробная документация API: `typespec/DOCUMENTATION.md`.

## Frontend

React-приложение в `frontend/` (TypeScript, Vite, shadcn/ui, TanStack Query). Данные только через API по контракту.

**Страницы:** `/` — типы событий; `/book/:id` — слоты и бронирование; `/admin/event-types` — CRUD; `/admin/bookings` — предстоящие встречи.

**Запуск (с mock API через Prism):**
```bash
cd typespec && npm run compile
cd ../frontend && npm install
npm run dev:mock
```

**С реальным backend:** задайте `VITE_API_BASE_URL` или `VITE_API_PROXY_TARGET` (см. `frontend/.env.example`).

Типы API: `npm run generate:api` (из скомпилированного OpenAPI).
