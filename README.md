# Forgeboard

Forgeboard is a local-first operations dashboard for open-source maintainers.

The current version ships as a TypeScript/Vite prototype with realistic fixtures,
a scoring engine, an interactive maintainer queue, release readiness signals,
and JSON export. It is intentionally small enough to inspect, but structured as
the seed of a larger project.

## What it tracks

- maintainer load from stale and unanswered issues
- release readiness from cadence, checks, and dependency alerts
- security posture from policies, alerts, and security work items
- automation health from CI configuration and failing checks
- repository-level work queues for issues, pull requests, releases, and security

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Tests:

```bash
npm test
```

## Project shape

```text
src/
  domain.ts        shared repository and scoring types
  fixtures.ts      realistic local fixture data
  scoring.ts       maintainer signal scoring engine
  main.ts          local-first dashboard UI
  style.css        application styling
tests/
  scoring.test.ts  unit tests for the scoring engine
docs/
  ARCHITECTURE.md  adapter and roadmap notes
```

## Roadmap

- GitHub REST and GraphQL adapters
- persisted local workspaces
- custom scoring profiles per project
- release-note draft generation
- maintainer SLA views
- GitHub Actions report export
- hosted read-only board mode

## License

MIT
