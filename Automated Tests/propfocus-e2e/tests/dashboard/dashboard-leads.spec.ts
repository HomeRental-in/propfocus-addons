import { test, expect } from '@playwright/test';

test('Dashboard Navigation @sanity', async ({ page }) => {

  // Open login page
  await page.goto('https://dev.propfocus.in/dashboard/login');

  // Enter phone number
  await page
    .getByRole('textbox', { name: 'Phone Number' })
    .fill('9999999999');

  // Send OTP
  await page
    .getByRole('button', { name: 'Send OTP' })
    .click();

  // Enter OTP
  await page
    .getByRole('textbox', { name: 'Verification Code' })
    .fill('123456');

  // Login
  await page
    .getByRole('button', { name: 'Verify & Sign In' })
    .click();

  // Handle popup
  const understandBtn = page.getByRole('button', {
    name: 'I understand'
  });

  if (await understandBtn.isVisible()) {
    await understandBtn.click();
  }

  // Navigate to All Leads
  await page
    .getByRole('button', { name: 'All Leads' })
    .click();

  // Open Engaged Leads
  await page
    .getByRole('button', { name: /Engaged Leads/i })
    .click();

  // Open Site Visits
  await page
    .getByRole('button', { name: /Site Visits/i })
    .click();

  // Open Microsites
  await page
    .getByRole('button', { name: /Microsites Generated/i })
    .click();

  // Open Profile/User popup
  const profileBtn = page.getByRole('button', { name: 'Profile' });

await expect(profileBtn).toBeVisible();

await profileBtn.click();

  // Close popup
  await page
    .getByRole('button', { name: 'Close' })
    .click();

  // Keep browser open for observation
  await page.waitForTimeout(10000);

});