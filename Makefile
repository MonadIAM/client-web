.PHONY: env start build tsc lint lint-fix stylelint knip secrets-check api-gen clean

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
api-gen:
	OPENAPI_SERVICE="$(or $(SERVICE),$(error SERVICE is required))" OPENAPI_TAG="$(TAG)" pnpm exec openapi-ts --file hey-api.config.mjs
