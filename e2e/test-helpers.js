import path from 'path';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

export async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function retry(fn, maxRetries = 3, delay = 300) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
    }
    await sleep(delay);
  }
  return null;
}

export async function waitForText(page, textRegex, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const count = await page.locator(`text=${textRegex}`).count();
    if (count > 0) return true;
    await sleep(200);
  }
  return false;
}

export async function waitForElement(page, selector, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const count = await page.locator(selector).count();
    if (count > 0) return true;
    await sleep(200);
  }
  return false;
}

export async function clickButtonIfEnabled(page, textRegex, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const btn = page.locator('button').filter({ hasText: textRegex }).first();
      const count = await btn.count();
      if (count > 0) {
        const isDisabled = await btn.isDisabled();
        if (!isDisabled) {
          // Use force:true to bypass actionability checks.
          // OperationGroup's overflow:hidden wrapper can intercept pointer events
          // during its maxHeight animation, even though the button is visible and enabled.
          await btn.click({ force: true });
          return true;
        }
      }
    } catch {}
    await sleep(200);
  }
  return false;
}

export async function closeModalIfOpen(page) {
  try {
    await page.keyboard.press('Escape');
    await sleep(200);
  } catch {}
}

export async function getVisibleInputs(page) {
  const allInputs = page.locator('input');
  const visible = [];
  const count = await allInputs.count();
  for (let i = 0; i < count; i++) {
    const input = allInputs.nth(i);
    try {
      const isHidden = await input.evaluate(el => {
        return el.offsetParent === null ||
               el.classList.contains('hidden') ||
               el.type === 'file' ||
               el.closest('.hidden') ||
               el.style.display === 'none';
      });
      if (!isHidden) visible.push(input);
    } catch {}
  }
  return visible;
}

export async function fillInput(page, input, value) {
  await input.click();
  await input.clear();
  await input.pressSequentially(String(value), { delay: 30 });
  await input.press('Tab');
  await sleep(200);
}

export async function assertWithRetry(results, conditionFn, passMsg, failMsg, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await conditionFn();
      if (result) {
        results.passed.push(passMsg);
        return true;
      }
    } catch {}
    if (i < maxRetries - 1) await sleep(300);
  }
  results.failed.push(failMsg);
  return false;
}

export async function verifyScreenshot(screenshotPath, minSize = 5000) {
  try {
    const stat = statSync(screenshotPath);
    if (stat.size < minSize) {
      console.warn(`  ⚠️ 截图可能异常: ${path.basename(screenshotPath)} (${stat.size} bytes)`);
      return false;
    }
    return true;
  } catch {
    console.warn(`  ⚠️ 截图文件不存在: ${screenshotPath}`);
    return false;
  }
}
