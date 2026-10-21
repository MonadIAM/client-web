.PHONY: env start build tsc lint lint-fix stylelint knip clean

env:
	[ -f .env.example ] && cp -f .env.example .env || echo '.env.example not found'

start:
	pnpm run start

build:
	pnpm run build

clean:
	rm -rf dist .cache *.tsbuildinfo

tsc:
	pnpm run tsc

lint:
	pnpm run lint
	pnpm run stylelint

lint-fix:
	pnpm run lint -- --fix
	pnpm run stylelint -- --fix

stylelint:
	pnpm run stylelint

knip:
	pnpm run knip
