.PHONY: env start build tsc lint lint-fix stylelint knip secrets-check clean

# Infrastructure
env:
	[ -f .env.example ] && cp -f .env.example .env || echo '.env.example not found'

# Development
start:
	pnpm run start
build:
	pnpm run build
clean:
	rm -rf dist .cache *.tsbuildinfo
lint:
	pnpm run lint
	pnpm run stylelint
lint-fix:
	pnpm run lint -- --fix
	pnpm run stylelint -- --fix
tsc:
	pnpm run tsc
knip:
	pnpm run knip
secrets-check:
	pnpm run secrets:check
