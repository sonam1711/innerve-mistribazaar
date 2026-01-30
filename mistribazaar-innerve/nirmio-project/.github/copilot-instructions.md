<!-- Auto-generated: initial guidance for AI coding agents. Update after scanning repository. -->
# Copilot instructions for this repository

Purpose
- Help AI coding agents become productive quickly when working in this repo.

Current repo state
- No source files or manifests were present when this file was created. Agents should run an initial repository scan and replace placeholders below with concrete paths/commands discovered.

Initial actions for the agent
- Run a repository scan to detect language and manifests: look for `package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, `Makefile`, or `.sln`.
- Identify the main entry points: search for `src/`, `cmd/`, `app/`, `server/`, `Main.*`, `index.*`, or `README.md` with run instructions.

What to document here (concise checklist)
- Primary language(s) and runtime versions.
- Build commands and dev-run commands (exact CLI to run locally).
- Test commands and where tests live (example: `npm test` runs tests in `tests/`).
- Lint/format commands and tools used (eslint, black, gofmt, clang-format).
- Where to find environment/config examples (`.env.example`, `config/`, `deploy/`).
- CI/CD expectations (GitHub Actions/workflows path) and required secrets.

Repository-specific patterns to capture
- Service boundaries / components: list folders that represent separate services or packages and their responsibilities.
- Data flows: where data originates, storage layers, and primary database/ORM files.
- Integration points: external APIs, message brokers, and cloud services (list config keys and client code locations).
- Conventions that differ from common defaults (custom test runner, nonstandard folder for assets, in-repo generated code, monorepo layout details).

How to write examples here
- Use concrete file links when possible (e.g., "Backend entry: src/server/app.py -> [src/server/app.py](src/server/app.py#L1)").
- Provide exact commands to reproduce local dev steps, e.g.:
  - Install: `npm ci` or `pip install -r requirements.txt`
  - Build: `npm run build` or `make build`
  - Run tests: `npm test` or `pytest tests/`

Merge guidance
- If an existing `.github/copilot-instructions.md` exists, preserve any bespoke notes (build commands, uncommon scripts) and insert missing items following the checklist above.

When you cannot discover something
- Prompt the maintainer with a concise question that includes what you looked for and where, e.g., "I scanned for `package.json`, `pyproject.toml`, and `README.md` but found none — which command starts the app locally?"

Reporting changes
- After updating this file, include a short summary of discovered commands, key files, and any ambiguities left for the maintainer.

Safety & scope
- Do not assume hidden CI secrets or external services; list them as TODOs to confirm with maintainers.
- Only document patterns that are verifiable from repository files.

Next step (agent)
- Re-run the repo scan and replace the placeholders above with concrete paths/commands. Then open a short PR or issue summarizing any missing info.
