import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const BUDGETS = {
  'index': 80,      // 80KB
  'vendor-react': 250, // 250KB
  'vendor-d3': 60,   // 60KB
};

const distDir = join(import.meta.dirname, '..', 'dist', 'assets');
let failed = false;

for (const file of readdirSync(distDir)) {
  if (!file.endsWith('.js')) continue;
  const sizeKB = Math.round(statSync(join(distDir, file)).size / 1024);
  const name = file.replace(/-[A-Za-z0-9_-]+\.js$/, '');

  for (const [pattern, limit] of Object.entries(BUDGETS)) {
    if (name === pattern && sizeKB > limit) {
      console.error(`BUDGET EXCEEDED: ${file} is ${sizeKB}KB (limit: ${limit}KB)`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('\nBundle size budget exceeded!');
  process.exit(1);
} else {
  console.log('Bundle size check passed.');
}
