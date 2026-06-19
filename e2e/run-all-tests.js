import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const coreTestFiles = [
  'test-home.js',
  'test-core.js',
  'test-advanced.js',
  'test-edge.js',
  'test-v5-features.js',
];

const comprehensiveTestFiles = [
  'test-comprehensive.js',
  'test-interactions.js',
  'test-persistence.js',
  'test-a11y.js',
];

function runTest(file, browser) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, file);
    // test-comprehensive.js runs many pages/animations and needs more time.
    const timeout = file === 'test-comprehensive.js' ? 600000 : 300000;

    const child = exec(`node "${filePath}"`, {
      encoding: 'utf-8',
      timeout,
      env: { ...process.env, BROWSER: browser },
    }, (error, stdout, stderr) => {
      const output = stdout || '';
      const errOutput = stderr || '';

      let passed = 0;
      let failed = 0;

      // Prefer a JSON result file written by the test (avoids stdout truncation
      // issues). Falls back to parsing stdout summary markers.
      const jsonResultFile = path.join(__dirname, `test-comprehensive-result-${browser}.json`);
      if (file === 'test-comprehensive.js' && existsSync(jsonResultFile)) {
        try {
          const json = JSON.parse(readFileSync(jsonResultFile, 'utf-8'));
          passed = json.totalPassed || 0;
          failed = json.totalFailed || 0;
        } catch {
          // Fall through to stdout parsing.
        }
      }

      if (passed === 0 && failed === 0) {
        // Prefer an explicit summary line; otherwise use the last 通过:/失败:
        // counts so per-section subtotals in test-comprehensive.js are not mistaken
        // for the final totals.
        const summaryMatch = output.match(/汇总:\s*通过=(\d+),\s*失败=(\d+)/);
        const passedMatches = [...output.matchAll(/通过:\s*(\d+)/g)];
        const failedMatches = [...output.matchAll(/失败:\s*(\d+)/g)];

        if (summaryMatch) {
          passed = parseInt(summaryMatch[1], 10);
          failed = parseInt(summaryMatch[2], 10);
        } else {
          if (passedMatches.length > 0) {
            passed = parseInt(passedMatches[passedMatches.length - 1][1], 10);
          }
          if (failedMatches.length > 0) {
            failed = parseInt(failedMatches[failedMatches.length - 1][1], 10);
          }
        }
      }

      resolve({
        file,
        status: failed === 0 && !error ? 'PASS' : 'FAIL',
        passed,
        failed,
        output,
        errOutput,
      });
    });

    // Stream output in real-time with prefix
    child.stdout?.on('data', (data) => {
      process.stdout.write(`[${file}] ${data}`);
    });
    child.stderr?.on('data', (data) => {
      process.stderr.write(`[${file}] ${data}`);
    });
  });
}

async function runTestsSequential(files, browser) {
  const results = [];
  for (const file of files) {
    const result = await runTest(file, browser);
    results.push(result);
  }
  return results;
}

const browsers = ['chromium', 'firefox'];
let grandTotalPassed = 0;
let grandTotalFailed = 0;

for (const browser of browsers) {
  console.log(`\n${'#'.repeat(60)}`);
  console.log(`# Browser: ${browser.toUpperCase()}`);
  console.log('#'.repeat(60));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Phase 1: Running ${coreTestFiles.length} core test files with staggered start [${browser}]...`);
  console.log('='.repeat(60));

  const STAGGER_DELAY_MS = 2000;
  const startTime = Date.now();

  // Stagger test starts to avoid simultaneous navigation, screenshot overwrites,
  // and localStorage state leaking between tests
  const staggeredRun = async (file, index) => {
    await new Promise(r => setTimeout(r, index * STAGGER_DELAY_MS));
    return runTest(file, browser);
  };
  const coreResults = await Promise.all(coreTestFiles.map((f, i) => staggeredRun(f, i)));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Phase 2: Running ${comprehensiveTestFiles.length} comprehensive test files sequentially [${browser}]...`);
  console.log('='.repeat(60));

  const comprehensiveResults = await runTestsSequential(comprehensiveTestFiles, browser);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const allResults = [...coreResults, ...comprehensiveResults];

  let totalPassed = 0;
  let totalFailed = 0;

  allResults.forEach((r) => {
    totalPassed += r.passed;
    totalFailed += r.failed;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`E2E 测试汇总报告 [${browser.toUpperCase()}]`);
  console.log('='.repeat(60));
  console.log(`总测试用例: ${totalPassed + totalFailed}`);
  console.log(`通过: ${totalPassed}`);
  console.log(`失败: ${totalFailed}`);
  console.log(`通过率: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log(`总耗时: ${elapsed}s`);
  console.log('');

  allResults.forEach((r) => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.file}: ${r.passed} passed, ${r.failed} failed`);
  });

  grandTotalPassed += totalPassed;
  grandTotalFailed += totalFailed;
}

console.log('\n截图保存在: e2e/screenshots/');

// Grand summary
console.log(`\n${'#'.repeat(60)}`);
console.log(`# 跨浏览器测试汇总 (Cross-Browser Summary)`);
console.log('#'.repeat(60));
console.log(`总测试用例: ${grandTotalPassed + grandTotalFailed}`);
console.log(`通过: ${grandTotalPassed}`);
console.log(`失败: ${grandTotalFailed}`);
console.log(`通过率: ${((grandTotalPassed / (grandTotalPassed + grandTotalFailed)) * 100).toFixed(1)}%`);

if (grandTotalFailed > 0) {
  console.log(`\n⚠️  部分测试失败，请检查上述错误信息`);
}

process.exit(grandTotalFailed > 0 ? 1 : 0);
