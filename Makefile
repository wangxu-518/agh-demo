.PHONY: check test lint typecheck clean

check: lint typecheck test

test:
	pytest tests/ -v --tb=short

lint:
	ruff check app/ tests/ --fix
	ruff format --check app/ tests/

typecheck:
	mypy app/ --ignore-missing-imports

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name '*.pyc' -delete 2>/dev/null || true
	find . -type d -name '.ruff_cache' -exec rm -rf {} + 2>/dev/null || true