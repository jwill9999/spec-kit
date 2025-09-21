
.PHONY: help specify-wizard

help:
	@echo "Project setup:"
	@echo "  make specify-wizard  # Launch the project setup wizard"

# --- Specify CLI wrapper (Wizard-only) ---
specify-wizard:
	@npm run --silent specify -- wizard -- $(args)

coverage:
	@npm run test:coverage

test-watch:
	@npm run test:watch

lint:
	@npm run fix

build:
	@npm run build