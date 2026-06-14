# План разработки — BookCalls

Сервис бронирования слотов (упрощённый аналог Cal.com): контракт на **TypeSpec** →
**.NET 10 minimal API** + **React 19 / Vite / TanStack Query / shadcn-ui**, e2e на Playwright,
хранилище **in-memory**.

**Ограничения MVP (сохраняем):** без регистрации/авторизации, один владелец `default`,
окно записи 14 дней, одно время — одна запись глобально, рабочие часы 09:00–18:00 UTC.

**Фокус первой итерации:** сбалансированно — сперва баги, затем флагман «отмена/перенос брони».

## Рабочее соглашение (contract-first)
Любое изменение API: 1) правим `typespec/` → `cd typespec && npm run compile`; 2) реализуем
backend; 3) `cd frontend && npm run generate:api` + UI; 4) покрываем e2e-тестом. Изменения
валидации отражаем в `typespec/DOCUMENTATION.md`.

---

## Фаза 1 — Баги

| # | Баг | Где | Исправление |
|---|-----|-----|-------------|
| BUG-1 | Удаление EventType осиротевает брони (целостность) | `Services/EventTypeService.cs` (`Delete`) | Запретить удаление, если есть будущие неотменённые брони → `409 EVENT_TYPE_HAS_BOOKINGS`. Отразить в `typespec/routes/admin.tsp` и тосте `EventTypesAdminPage.tsx` |
| BUG-2 | `from > to` в слотах молча отдаёт пусто | `Services/SlotService.cs`, `Endpoints/PublicEndpoints.cs` | Возвращать `400 INVALID_RANGE` через `Common/AppException.cs` |
| BUG-3 | `endAt` брони может выходить за 14-дневное окно | `Services/BookingService.cs` (`Create`) | Добавить проверку `endAt <= now.AddDays(14)` (сейчас проверяется только `startAt`) |
| BUG-4 | Устаревшее состояние формы/слота после успешной брони | `pages/guest/BookingPage.tsx`, `components/BookingForm.tsx` | Сбрасывать выбранный слот и поля формы при успехе/размонтировании |
| BUG-5 | Окно записи показывается как сырой `YYYY-MM-DD` | `pages/guest/BookingPage.tsx`, `lib/dates.ts` | Форматировать через хелпер дат (добавить `formatUtcDate` при отсутствии) |
| BUG-6 | Поле длительности принимает нецелые значения | `components/EventTypeForm.tsx` | Добавить `step="1"` и приведение к целому перед отправкой |

> **Не баги (вне scope, не трогаем):** отсутствие авторизации админки и «лёгкая» валидация
> email — заложены доменом MVP. «Гонка в генерации id» ложная: `Interlocked.Increment` атомарен.

---

## Фаза 2 — Флагман: отмена и перенос брони (без авторизации)

Доступ без аккаунтов: при создании брони генерируется секретный **`cancellationToken`** (GUID).
Возвращается только в ответе `POST /bookings` и при доступе по нему; в `/admin/bookings` и
обычных ответах **не отдаётся**. Управление — по паре `{id, token}`.

**Модель `Booking`:** добавить `status` (`confirmed | cancelled`, по умолчанию `confirmed`) и
`cancellationToken`. Конфликт-чек слотов (`SlotService` и `BookingService.Create`) должен
**игнорировать `cancelled`** — отменённое время снова свободно.

**Эндпоинты (TypeSpec → backend):**
- `GET /bookings/{id}?token=...` — деталь брони для страницы управления (404/403 при несовпадении).
- `POST /bookings/{id}/cancel` `{ token }` — `status=cancelled` (идемпотентно), освобождает слот.
- `POST /bookings/{id}/reschedule` `{ token, startAt }` — проверка свободного слота + окна, перенос; `409` при занятом времени.

Файлы: `typespec/models/booking.tsp`, `typespec/routes/public.tsp`, `Models/Booking.cs`,
`Services/BookingService.cs`, `Endpoints/PublicEndpoints.cs`, `Storage/InMemoryStore.cs`.

**Frontend:**
- Экран успеха (`BookingPage.tsx`): ссылка «Управление бронью» `/booking/:id?token=...` + копирование.
- Новая страница `pages/guest/ManageBookingPage.tsx` (роут в `App.tsx`): деталь + «Отменить»
  (через `Dialog`) и «Перенести» (переиспользовать `SlotPicker`).
- Хуки `api/hooks.ts`: `useBooking(id, token)`, `useCancelBooking()`, `useRescheduleBooking()`
  с инвалидацией `slots` и `admin/bookings`.
- `BookingsTable.tsx`: колонка статуса, отменённые визуально отделить.

**Тесты (`e2e/tests/`):** создать бронь → открыть управление по токену → отменить → слот снова
доступен; перенос на свободный слот. Переиспользовать `helpers.ts` (`bookViaApi`, `fetchSlots`).

---

## Фаза 3 — Бэклог (следующие итерации)
- Таймзоны для гостя (показ слотов в локальном времени, backend остаётся UTC).
- Настраиваемые рабочие часы владельца вместо хардкода 09–18 UTC.
- iCal/.ics «Add to calendar» на экране подтверждения.
- Поиск/сортировка в админ-таблице броней.
- Буфер между встречами (per-EventType `bufferMinutes`).
- e2e-покрытие admin CRUD типов событий (сейчас отсутствует).

---

## Проверка (end-to-end)
1. `cd typespec && npm run compile` — контракт компилируется.
2. `cd frontend && npm run generate:api` — типы соответствуют контракту.
3. `cd backend && dotnet build`; `cd frontend && npm run build`.
4. `cd e2e && npm test` — старые тесты зелёные + новый сценарий отмены/переноса.
5. Ручная: `npm run dev` с реальным backend → создать бронь → отменить по ссылке → слот вернулся
   в выдачу; удалить тип с будущей бронью → понятная ошибка 409.
