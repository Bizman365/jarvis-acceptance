# jarvis-acceptance

Scratch target repository for the JarvisV2 seeded-goal acceptance gate (JAR-46).
Public by design: `provisionWorktree` fetches with no auth; only the push side is authenticated.

ACCEPTANCE: JAR-46

REVIEWER_IDENTITY: JAR-66

SCHEDULER: JAR-69

## Usage

### Scheduler snapshot

Run the scheduler to print a staged execution snapshot as JSON and exit 0:

```
node scripts/scheduler.js
```

It groups jobs into ordered stages (each stage runs only after its dependencies
complete) and writes a snapshot object to stdout, e.g.:

```
{"marker":"SCHEDULER: JAR-69","ok":true,"jobCount":5,"stageCount":4,"stages":[["fetch"],["build","lint"],["test"],["deploy"]],"timestamp":"2026-07-07T00:00:00.000Z"}
```

### Health check

Run the health-check script to print a JSON status object and exit 0:

```
node scripts/health-check.js
```

It writes a JSON object to stdout with `ok: true` and an ISO 8601 `timestamp`, e.g.:

```
{"ok":true,"timestamp":"2026-07-07T00:00:00.000Z"}
```
