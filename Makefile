.PHONY: check test build dev clean

NODE := C:/Users/wangx/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe

test:
	"$(NODE)" node_modules/vitest/vitest.mjs run

build:
	"$(NODE)" node_modules/vite/bin/vite.js build

check: test build

dev:
	"$(NODE)" node_modules/vite/bin/vite.js --host 0.0.0.0
