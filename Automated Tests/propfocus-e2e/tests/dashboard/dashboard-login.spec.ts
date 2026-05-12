import { test, expect } from '@playwright/test';

test('Dashboard Login @sanity', async ({ page }) => {

  await page.goto('https://dev.propfocus.in/dashboard/login');

  // Verify phone input visible
  await expect(
    page.getByRole('textbox', { name: 'Phone Number' })
  ).toBeEmpty();

  // Enter test phone number
  await page
    .getByRole('textbox', { name: 'Phone Number' })
    .fill('9999999999');

  // Send OTP
  await page
    .getByRole('button', { name: 'Send OTP' })
    .click();

  // Enter static OTP
  await page
    .getByRole('textbox', { name: 'Verification Code' })
    .fill('123456');

  // Verify & Sign In
  await page
    .getByRole('button', { name: 'Verify & Sign In' })
    .click();

  // Handle popup if appears
  const understandBtn = page.getByRole('button', {
    name: 'I understand'
  });

  if (await understandBtn.isVisible()) {
    await understandBtn.click();
  }
await expect(
  page.getByRole('button', { name: 'All Leads' })
).toBeVisible();

await page.waitForTimeout(5000);
});