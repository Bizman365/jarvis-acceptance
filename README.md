# jarvis-acceptance

Scratch target repository for the JarvisV2 seeded-goal acceptance gate (JAR-46).
Public by design: `provisionWorktree` fetches with no auth; only the push side is authenticated.

ACCEPTANCE: JAR-46

## Usage

### Health check

Run the health-check script to verify the environment is responsive:

```sh
node scripts/health-check.js
```

It prints a JSON object to stdout and exits `0`:

```json
{"ok":true,"timestamp":"2026-07-06T00:00:00.000Z"}
```

The `timestamp` is an ISO 8601 string captured at run time.
