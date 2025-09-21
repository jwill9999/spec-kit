#!/usr/bin/env node

let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  data += chunk;
});
process.stdin.on('end', () => {
  try {
    const obj = JSON.parse(data);
    process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  } catch (_e) {
    // If input isn't JSON, just print raw
    process.stdout.write(data);
  }
});

// If nothing is piped, exit gracefully
if (process.stdin.isTTY) {
  process.exit(0);
}
