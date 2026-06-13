import { execSync } from 'child_process';
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

let totalPassed = 0;
let totalFailed = 0;
const allResults = [];

for (const file of testFiles) {
  const filePath = path.join(__dirname, file);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${file}`);
  console.log('='.repeat(60));

  try {
    const output = execSync(`node "${filePath}"`, {
      encoding: 'utf-8',
      timeout: 300000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(output);

    const passedMatch = output.match(/通过:\s*(\d+)/);
    const failedMatch = output.match(/失败:\s*(\d+)/);

    const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;

    totalPassed += passed;
    totalFailed += failed;

    allResults.push({
      file,
      status: failed === 0 ? 'PASS' : 'FAIL',
      passed,
      failed,
    });
  } catch (error) {
    console.log(error.stdout || '');
    console.error(error.stderr || '');

    const output = error.stdout || '';
    const passedMatch = output.match(/通过:\s*(\d+)/);
    const failedMatch = output.match(/失败:\s*(\d+)/);

    const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;

    totalPassed += passed;
    totalFailed += failed;

    allResults.push({
      file,
      status: 'FAIL',
      passed,
      failed,
    });
  }
}

console.log('\n' + '='.repeat(60));
console.log('E2E 测试汇总报告');
console.log('='.repeat(60));
console.log(`总测试用例: ${totalPassed + totalFailed}`);
console.log(`通过: ${totalPassed}`);
console.log(`失败: ${totalFailed}`);
console.log(`通过率: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
console.log('');

allResults.forEach(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${r.file}: ${r.passed} passed, ${r.failed} failed`);
});

console.log('\n截图保存在: e2e/screenshots/');

if (totalFailed > 0) {
  console.log('\n⚠️  部分测试失败，请检查上述错误信息');
}

process.exit(totalFailed > 0 ? 1 : 0);
