import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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
];

function runTest(file, browser) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, file);

    const child = exec(`node "${filePath}"`, {
      encoding: 'utf-8',
      timeout: 300000,
      env: { ...process.env, BROWSER: browser },
    }, (error, stdout, stderr) => {
      const output = stdout || '';
      const errOutput = stderr || '';

      const passedMatch = output.match(/通过:\s*(\d+)/);
      const failedMatch = output.match(/失败:\s*(\d+)/);

      const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;

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
  console.log(`Phase 1: Running ${coreTestFiles.length} core test files in parallel [${browser}]...`);
  console.log('='.repeat(60));

  const startTime = Date.now();
  const coreResults = await Promise.all(coreTestFiles.map(f => runTest(f, browser)));

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
