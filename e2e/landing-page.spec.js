import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page with all sections', async ({ page }) => {
    await page.goto('/');

    // Check hero section
    await expect(page.getByRole('heading', { name: /ゴイキャン/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /語彙力トレーニング/ })).toBeVisible();

    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /今すぐ始める/ });
    await expect(ctaButton).toBeVisible();

    // Check features section
    await expect(page.getByText('主な機能')).toBeVisible();
    await expect(page.getByText('間隔反復学習')).toBeVisible();
    await expect(page.getByText('実践的な例文')).toBeVisible();

    // Check usage flow
    await expect(page.getByText('使い方')).toBeVisible();

    // Check target users section
    await expect(page.getByText('こんな方におすすめ')).toBeVisible();

    // Check pricing section
    await expect(page.getByText('料金プラン')).toBeVisible();
    await expect(page.getByText('完全無料')).toBeVisible();
  });

  test('should navigate to quiz app when CTA button is clicked', async ({ page }) => {
    await page.goto('/');

    // Click CTA button
    const ctaButton = page.getByRole('link', { name: /今すぐ始める/ }).first();
    await ctaButton.click();

    // Should navigate to /app
    await expect(page).toHaveURL(/\/app$/);

    // Should display quiz start screen
    await expect(page.getByRole('heading', { name: /ゴイキャン/ })).toBeVisible();

    // Check for quiz mode buttons
    await expect(
      page.locator('button', { hasText: /今日の復習|全問おさらい|ミニクイズ/ }).first()
    ).toBeVisible();
  });
});
