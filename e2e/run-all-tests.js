import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = [
  'test-home.js',
  'test-core.js',
  'test-advanced.js',
  'test-edge.js',
  'test-v5-features.js',
];

function runTest(file) {
  return new Promise((resolve) => {
    const filePath = path.join(__dirname, file);

    const child = exec(`node "${filePath}"`, {
      encoding: 'utf-8',
      timeout: 300000,
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

console.log(`\n${'='.repeat(60)}`);
console.log(`Running ${testFiles.length} test files in parallel...`);
console.log('='.repeat(60));

const startTime = Date.now();
const allResults = await Promise.all(testFiles.map(runTest));
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

let totalPassed = 0;
let totalFailed = 0;

allResults.forEach((r) => {
  totalPassed += r.passed;
  totalFailed += r.failed;
});

console.log('\n' + '='.repeat(60));
console.log('E2E 测试汇总报告');
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

console.log('\n截图保存在: e2e/screenshots/');

if (totalFailed > 0) {
  console.log('\n⚠️  部分测试失败，请检查上述错误信息');
}

process.exit(totalFailed > 0 ? 1 : 0);
