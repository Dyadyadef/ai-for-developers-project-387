import { expect, test, type Locator, type Page } from '@playwright/test'
import { bookViaApi, fetchSlots, uniqueGuest } from './helpers'

// Сид-данные backend: тип события всегда присутствует после старта.
const EVENT_TYPE_ID = 'consultation-30'

/** Кнопки слотов внутри секции «Свободные слоты (UTC)», в порядке возрастания времени. */
function slotButtons(page: Page): Locator {
  return page.locator('section', { hasText: 'Свободные слоты' }).getByRole('button')
}

/** Заполняет форму гостя и отправляет бронирование. */
async function submitBookingForm(
  page: Page,
  guest: { name: string; email: string },
): Promise<void> {
  await page.locator('#guestName').fill(guest.name)
  await page.locator('#guestEmail').fill(guest.email)
  await page.getByRole('button', { name: 'Записаться' }).click()
}

test.describe('Бронирование встречи', () => {
  test('основной сценарий: гость выбирает тип события, слот и создаёт бронь', async ({ page }) => {
    const guest = uniqueGuest('happy')

    // 1. Главная — список типов событий.
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible()

    // 2. Переход к выбору времени по первому типу события.
    await page.getByRole('link', { name: 'Выбрать время' }).first().click()
    await expect(page).toHaveURL(/\/book\//)

    // 3. Выбор первого доступного слота.
    await expect(slotButtons(page).first()).toBeVisible()
    await slotButtons(page).first().click()

    // 4. Имя + email и отправка.
    await submitBookingForm(page, guest)

    // 5. Экран успеха.
    await expect(page.getByRole('heading', { name: 'Бронирование создано' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'На главную' })).toBeVisible()
  })

  test('конфликт: занятое время даёт ошибку 409 в форме', async ({ page, request }) => {
    // Первый свободный слот: API и UI отсортированы одинаково, поэтому это первая кнопка слота.
    const slots = await fetchSlots(request, EVENT_TYPE_ID)
    expect(slots.length).toBeGreaterThan(0)
    const target = slots[0]

    // Открываем страницу — снимок слотов ещё содержит target (первую кнопку).
    await page.goto(`/book/${EVENT_TYPE_ID}`)
    const firstSlot = slotButtons(page).first()
    await expect(firstSlot).toBeVisible()

    // «Другой гость» успевает занять это же время через API.
    await bookViaApi(request, {
      eventTypeId: EVENT_TYPE_ID,
      startAt: target.startAt,
      guestName: 'Опередивший гость',
      guestEmail: 'first@example.com',
    })

    // Пытаемся забронировать уже занятый слот из UI.
    await firstSlot.click()
    await submitBookingForm(page, uniqueGuest('conflict'))

    await expect(
      page.getByText('Это время уже занято. Выберите другой слот.'),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Бронирование создано' })).toHaveCount(0)
  })

  test('админка: созданная бронь видна в списке предстоящих встреч', async ({ page }) => {
    const guest = uniqueGuest('admin')

    // Полный путь бронирования через UI.
    await page.goto('/')
    await page.getByRole('link', { name: 'Выбрать время' }).first().click()
    await expect(slotButtons(page).first()).toBeVisible()
    await slotButtons(page).first().click()
    await submitBookingForm(page, guest)
    await expect(page.getByRole('heading', { name: 'Бронирование создано' })).toBeVisible()

    // В админку переходим клиентской навигацией (прямой GET /admin перехватил бы Vite-proxy).
    await page.getByRole('link', { name: 'Админ' }).click()
    await page.getByRole('link', { name: 'Предстоящие встречи' }).click()
    await expect(page.getByRole('heading', { name: 'Предстоящие встречи' })).toBeVisible()

    const row = page.getByRole('row', { name: new RegExp(guest.name) })
    await expect(row).toBeVisible()
    await expect(row).toContainText(guest.email)
  })
})
