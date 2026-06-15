# Календарь звонков (BookCalls)

Упрощённый аналог Cal.com для бронирования встреч.

## 🌐 Демо

**Опубликованное приложение:** https://bookcalls.onrender.com

Развёрнуто на [Render](https://render.com) одним Docker-контейнером: backend (.NET) отдаёт
собранный SPA (React) и слушает порт из переменной окружения `PORT`. Сборка описана в
[`Dockerfile`](./Dockerfile), параметры сервиса — в [`render.yaml`](./render.yaml).

> Бесплатный план Render усыпляет сервис при простое — первый запрос после паузы может
> открываться ~30–60 секунд. В админку (`/admin/...`) заходите переходами внутри приложения,
> а не прямой ссылкой.

## 🌙 Ночной аудит Lighthouse

Каждую ночь (01:00 UTC / 04:00 МСК) workflow [`lighthouse.yml`](./.github/workflows/lighthouse.yml)
прогоняет **Lighthouse CLI** по прод-сайту и готовит отчёт к утру команды:

- **Артефакт** `lighthouse-reports` — полный HTML/JSON по каждой странице (хранится 30 дней);
- **Job Summary** — таблица оценок прямо в логе запуска;
- **GitHub Issue** с меткой `lighthouse` — сводка оценок и рекомендации; держим один актуальный
  отчёт (прошлый авто-закрывается). Если нужны правки — прямо в issue пишем `/oc fix`.

**Запуск вручную:** вкладка *Actions → Lighthouse → Run workflow* (можно переопределить
`base_url` и список путей). Аудитятся `/` и `/book/consultation-30`; перед замером сервис
«прогревается» (free-план Render засыпает при простое).

### Hexlet tests and linter status:
[![Actions Status](https://github.com/Dyadyadef/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Dyadyadef/ai-for-developers-project-387/actions)