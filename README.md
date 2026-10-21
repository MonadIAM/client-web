# @monadiam/client-web

Language: **EN** | [RU](README.ru.md)

Web client for the MonadIAM platform.

----

<details>
<summary><strong>Local Development</strong></summary>

1. Install dependencies and prepare the local environment file:
```sh
pnpm install --frozen-lockfile
cp .env.example .env
```

2. Start the development server at `http://localhost:3000`:
```sh
make start
```

</details>

----

<details>
<summary><strong>Project Commands</strong></summary>

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `make env`           | Copy `.env.example` to `.env`.                 |
| `make start`         | Start the development server.                  |
| `make build`         | Build the production bundle.                   |
| `make tsc`           | Check TypeScript types.                        |
| `make lint`          | Run ESLint and Stylelint.                      |
| `make lint-fix`      | Apply available ESLint and Stylelint fixes.    |
| `make stylelint`     | Check CSS with Stylelint.                      |
| `make knip`          | Find unused files, exports, and dependencies.  |
| `make secrets-check` | Scan staged changes for secrets with Gitleaks. |
| `make clean`         | Remove generated build and cache files.        |

</details>
