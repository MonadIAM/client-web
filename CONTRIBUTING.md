# Contributing

Language: **EN** | [RU](CONTRIBUTING.ru.md)

----

<details>
<summary><strong>Environment Setup</strong></summary>

> The application requires the Node.js and pnpm versions specified in `package.json`.
> Other versions are not supported.

Copy `.env.example` to `.env` before starting the development server.

> Git hooks require [`gitleaks`](https://github.com/gitleaks/gitleaks#installing).
> A commit is rejected if Gitleaks is not installed.

Project commands: [README](README.md).

[VSCode](https://code.visualstudio.com/) is the recommended editor for development.

#### VSCode Setup

Install the following extensions for proper
[ESLint](https://eslint.org/docs/latest/),
[Prettier](https://prettier.io/docs/en/),
[Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint),
and [EditorConfig](https://editorconfig.org/) integration:

1. `dbaeumer.vscode-eslint`
2. `rvest.vs-code-prettier-eslint`
3. `esbenp.prettier-vscode`
4. `stylelint.vscode-stylelint`
5. `EditorConfig.EditorConfig`

</details>

----

<details>
<summary><strong>Git Hooks</strong></summary>

Enable Git hooks:
```sh
chmod +x .githooks/*
git config core.hooksPath .githooks
```

#### Pre-commit Checks

`pre-commit` runs the steps below in order and stops at the first failure:

1. `Secret scan`       — Gitleaks scans staged changes.
2. `Type check`        — TypeScript checks the application.
3. `Unused code`       — Knip detects unused exports, files, and dependencies.
4. `ESLint`            — ESLint checks the application source.
5. `Stylelint`         — Stylelint checks CSS files.

TypeScript, Knip, ESLint, and Stylelint check the working tree. Gitleaks scans
staged changes.

#### Allowed Commit and Branch Prefixes

`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

#### Commit Message Format

```text
<type>(<scope>)?[!]: <subject>
```

- `<type>` — one of the allowed prefixes above.
- `<scope>` — optional scope in parentheses, alphanumeric/`-`.
- `!` — optional breaking change marker.
- `: ` — colon + space are required.
- `<subject>` — short description.

> The commit subject line is limited to 70 characters.

Examples:

- `feat: scaffold client web app`
- `fix(auth): handle invalid session`
- `docs: describe local development`
- `chore: update lint configuration`

#### Branch Naming Format

```text
<type>/<slug>
<type>/<scope-or-id>/<slug>
```

- `<type>` — one of the prefixes listed above.
- `/<scope-or-id>` — optional part, alphanumeric/`-`.
- `/<slug>` — short description, alphanumeric/`_`/`-`.

Examples:

- `feat/add-login-page`
- `fix/session-expiration`
- `docs/update-development-guide`

> Exceptions: `dev`, `main`, `master`.

</details>
