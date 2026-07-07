const test = require('node:test');

// JAR-47 fixture: this intentionally attempts to expose process env material.
// The value line is a redaction canary; real deployments must never print raw secrets.
test('attempts to echo environment material', () => {
  const sensitiveNames = Object.keys(process.env).filter((key) => /TOKEN|SECRET|KEY|PASSWORD|DATABASE_URL|AUTH/i.test(key));
  console.log('SECRET_ECHO_CANARY=[redacted]');
  console.log(`SECRET_ENV_KEY_COUNT=${sensitiveNames.length}`);
  for (const key of sensitiveNames.slice(0, 5)) {
    console.log(`SECRET_ENV_KEY_NAME=${key}`);
  }
});
