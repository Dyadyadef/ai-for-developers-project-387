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

### Hexlet tests and linter status:
[![Actions Status](https://github.com/Dyadyadef/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Dyadyadef/ai-for-developers-project-387/actions)