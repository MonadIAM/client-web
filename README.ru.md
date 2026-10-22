# @monadiam/client-web

Language: [EN](README.md) | **RU**

Веб-клиент платформы MonadIAM.

----

<details>
<summary><strong>Локальный запуск</strong></summary>

1. Установите зависимости и подготовьте локальный файл окружения:
```sh
pnpm install --frozen-lockfile
cp .env.example .env
```

2. Запустите dev-сервер по адресу `http://localhost:3000`:
```sh
make start
```

</details>

----

<details>
<summary><strong>Команды проекта</strong></summary>

| Команда              | Описание                                             |
| -------------------- | ---------------------------------------------------- |
| `make env`           | Скопировать `.env.example` в `.env`.                 |
| `make env-check`     | Проверить переменные окружения с помощью Zod.        |
| `make start`         | Запустить dev-сервер.                                |
| `make build`         | Собрать production bundle.                           |
| `make tsc`           | Проверить типы TypeScript.                           |
| `make lint`          | Запустить ESLint и Stylelint.                        |
| `make lint-fix`      | Применить доступные исправления ESLint и Stylelint.  |
| `make stylelint`     | Проверить CSS с помощью Stylelint.                   |
| `make knip`          | Найти неиспользуемые файлы, экспорты и зависимости.  |
| `make api-gen`       | Сгенерировать API: `SERVICE` + необязательный `TAG`. |
| `make secrets-check` | Проверить изменения на секреты с помощью Gitleaks.   |
| `make clean`         | Удалить созданные файлы сборки и кэша.               |

</details>
