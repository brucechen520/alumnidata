const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../src');
const excluded = new Set(['lib', 'member/vendor']);
const nativeCall = /(^|[^\w.$])(?:(?:window|self|globalThis|top|parent)\.)?(alert|confirm|prompt)\s*\(/gm;
let failures = 0;

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excluded.has(path.relative(root, full))) scan(full);
    } else if (/\.(js|vue)$/.test(entry.name)) {
      const source = fs.readFileSync(full, 'utf8');
      for (const match of source.matchAll(nativeCall)) {
        const line = source.slice(0, match.index).split('\n').length;
        console.error(`${path.relative(root, full)}:${line}: browser-native ${match[2]}() is forbidden`);
        failures++;
      }
    }
  }
}

scan(root);
if (failures) process.exit(1);
