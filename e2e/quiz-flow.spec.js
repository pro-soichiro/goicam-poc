import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
  });

  test('should display start screen with quiz mode options', async ({ page }) => {
    // Check start screen elements
    await expect(page.getByText('ゴイキャン')).toBeVisible();
    await expect(page.getByRole('button', { name: /今日の復習/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /全問おさらい/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /ミニクイズ/ })).toBeVisible();

    // Check stats display
    await expect(page.getByText(/スコア:/)).toBeVisible();
    await expect(page.getByText(/日/)).toBeVisible();
  });

  test('should complete a quiz from start to result', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for quiz screen to load
    await expect(page.locator('.timer-bar')).toBeVisible();
    await expect(page.locator('.term')).toBeVisible();
    await expect(page.locator('.choice-btn')).toHaveCount(4);

    // Answer 5 questions (loop through all questions)
    for (let i = 0; i < 5; i++) {
      // Wait for question to appear
      await expect(page.locator('.term')).toBeVisible();

      // Click first choice
      await page.locator('.choice-btn').first().click();

      // Wait for feedback
      await expect(page.locator('.feedback')).toBeVisible();

      // Check if it's the last question
      if (i < 4) {
        // Click next button
        await page.getByRole('button', { name: /次へ/ }).click();
      }
    }

    // Click next on last question to go to result screen
    await page.getByRole('button', { name: /次へ/ }).click();

    // Should show result screen
    await expect(page.getByText(/クイズ結果/)).toBeVisible();
    await expect(page.getByText(/スコア:/)).toBeVisible();
    await expect(page.getByRole('button', { name: /もう一度/ })).toBeVisible();
  });

  test('should display feedback after answering', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for quiz screen
    await expect(page.locator('.choice-btn')).toHaveCount(4);

    // Click first choice
    await page.locator('.choice-btn').first().click();

    // Should show feedback
    await expect(page.locator('.feedback')).toBeVisible();

    // Should show either correct or incorrect feedback
    const feedbackText = await page.locator('.feedback-title').textContent();
    expect(feedbackText).toMatch(/✅ 正解！|❌ 惜しい！/);

    // Should show next button
    await expect(page.getByRole('button', { name: /次へ/ })).toBeVisible();

    // Choices should be disabled
    const firstChoice = page.locator('.choice-btn').first();
    await expect(firstChoice).toBeDisabled();
  });

  test('should show progress indicator', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for quiz screen
    await expect(page.locator('.choice-btn')).toHaveCount(4);

    // Check progress in footer
    await expect(page.locator('footer')).toContainText(/進捗: 1 \/ 5問目/);

    // Answer first question
    await page.locator('.choice-btn').first().click();
    await page.getByRole('button', { name: /次へ/ }).click();

    // Progress should update
    await expect(page.locator('footer')).toContainText(/進捗: 2 \/ 5問目/);
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for quiz screen
    await expect(page.locator('.choice-btn')).toHaveCount(4);

    // Press '1' key
    await page.keyboard.press('1');

    // Should show feedback
    await expect(page.locator('.feedback')).toBeVisible();
  });

  test('should restart quiz from result screen', async ({ page }) => {
    // Start and complete quiz quickly
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Answer all questions quickly
    for (let i = 0; i < 5; i++) {
      await page.locator('.choice-btn').first().click();
      await page.getByRole('button', { name: /次へ/ }).click();
    }

    // Should be on result screen
    await expect(page.getByText(/クイズ結果/)).toBeVisible();

    // Click restart button
    await page.getByRole('button', { name: /もう一度/ }).click();

    // Should be back to start screen
    await expect(page.getByRole('button', { name: /今日の復習/ })).toBeVisible();
  });
});
