# Architecture

Forgeboard is designed around portable repository facts.

## Layers

- `domain.ts`: stable data contracts for repository snapshots and work items.
- `scoring.ts`: deterministic scoring that can run in a browser, CLI, or CI job.
- `fixtures.ts`: local data used while API adapters are not wired.
- `main.ts`: browser UI that renders the current workspace and exports JSON.

## Planned Adapters

```text
GitHub API -> RepositorySnapshot -> Scoring engine -> Dashboard / JSON / CI
Git log    -> Release signals     -> Scoring engine -> Release room
SBOM scan  -> Dependency alerts   -> Scoring engine -> Security posture
```

Adapters should be pure data loaders. They should not decide severity; severity
belongs in the scoring layer so teams can tune policy in one place.

## Scoring Notes

Scores are intentionally explainable. Each pillar produces a 0-100 value and the
total score is a weighted blend:

- maintainer load: 28%
- release readiness: 25%
- security posture: 27%
- automation: 20%

The weights are placeholders for the prototype and should become user-configured
profiles in a future release.
