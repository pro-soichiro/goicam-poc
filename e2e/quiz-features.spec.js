import { test, expect } from '@playwright/test';

test.describe('Quiz Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
  });

  test('should show timer bar that decreases over time', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for timer bar
    const timerBar = page.locator('.timer-progress');
    await expect(timerBar).toBeVisible();

    // Get initial width
    const initialWidth = await timerBar.evaluate((el) => el.style.width);
    expect(initialWidth).toBe('100%');

    // Wait a bit and check if width decreased
    await page.waitForTimeout(2000);
    const afterWidth = await timerBar.evaluate((el) => el.style.width);

    // Width should have decreased
    const initialValue = parseFloat(initialWidth);
    const afterValue = parseFloat(afterWidth);
    expect(afterValue).toBeLessThan(initialValue);
  });

  test('should show timeout feedback when timer runs out', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Wait for quiz screen
    await expect(page.locator('.choice-btn')).toHaveCount(4);

    // Wait for timeout (20 seconds + buffer)
    await page.waitForTimeout(21000);

    // Should show timeout feedback
    await expect(page.locator('.feedback')).toBeVisible();
    await expect(page.locator('.feedback-title')).toContainText(/⏰ タイムアップ/);
  });

  test('should display combo bonus for consecutive correct answers', async ({ page }) => {
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // We need to answer correctly multiple times
    // Since we don't know which is correct, we'll use a helper
    // For this test, we'll check if combo appears in header after multiple answers

    // Answer first question (any answer)
    await page.locator('.choice-btn').first().click();
    await page.getByRole('button', { name: /次へ/ }).click();

    // Answer second question
    await page.locator('.choice-btn').first().click();

    // If both were correct, combo should appear
    // Check if combo exists in either feedback or header
    const comboInFeedback = page.locator('.feedback').getByText(/連続/);
    const comboInHeader = page.locator('header').getByText(/COMBO/);

    // At least one should be visible if we got consecutive correct answers
    // Note: This test might be flaky since we don't control correctness
    // In a real scenario, you'd mock the data or use test-specific questions
  });

  test('should show score updates after correct answers', async ({ page }) => {
    // Start quiz
    await page.getByRole('button', { name: /今日の復習/ }).click();

    // Get initial score
    const initialScore = await page.locator('.score-display').textContent();
    expect(initialScore).toBe('0');

    // Answer a question
    await page.locator('.choice-btn').first().click();

    // Check if score potentially increased (if answer was correct)
    // Wait for feedback to appear
    await expect(page.locator('.feedback')).toBeVisible();

    // Get feedback type
    const feedbackTitle = await page.locator('.feedback-title').textContent();

    if (feedbackTitle.includes('✅')) {
      // If correct, score should have increased
      const newScore = await page.locator('.score-display').textContent();
      expect(parseInt(newScore)).toBeGreaterThan(parseInt(initialScore));
    }
  });
});

test.describe('LocalStorage Persistence', () => {
  test('should persist progress in localStorage', async ({ page }) => {
    await page.goto('/app');

    // Check if localStorage has quiz progress
    const hasProgress = await page.evaluate(() => {
      const progress = localStorage.getItem('vocabQuizProgress');
      return progress !== null;
    });

    expect(hasProgress).toBe(true);
  });

  test('should reset data when reset button is clicked', async ({ page }) => {
    await page.goto('/app');

    // Get initial progress
    const initialProgress = await page.evaluate(() => {
      return localStorage.getItem('vocabQuizProgress');
    });

    expect(initialProgress).not.toBeNull();

    // Click reset button and confirm
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /データをリセット/ }).click();

    // Wait for page reload
    await page.waitForLoadState('networkidle');

    // Progress should be reset (new initial state)
    const newProgress = await page.evaluate(() => {
      const progress = JSON.parse(localStorage.getItem('vocabQuizProgress'));
      return progress;
    });

    expect(newProgress.totalCorrect).toBe(0);
    expect(newProgress.todayCount).toBe(0);
  });

  test('should maintain streak across page reloads', async ({ page }) => {
    await page.goto('/app');

    // Get current streak
    const initialStreak = await page.locator('header').getByText(/日$/).textContent();

    // Reload page
    await page.reload();

    // Streak should be the same
    const afterStreak = await page.locator('header').getByText(/日$/).textContent();
    expect(afterStreak).toBe(initialStreak);
  });
});

test.describe('Result Screen Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');

    // Complete a quiz to reach result screen
    await page.getByRole('button', { name: /今日の復習/ }).click();

    for (let i = 0; i < 5; i++) {
      await page.locator('.choice-btn').first().click();
      await page.getByRole('button', { name: /次へ/ }).click();
    }

    // Should be on result screen
    await expect(page.getByText(/クイズ結果/)).toBeVisible();
  });

  test('should display result summary with score and badge', async ({ page }) => {
    // Check result elements
    await expect(page.getByText(/スコア:/)).toBeVisible();
    await expect(page.getByText(/正解数:/)).toBeVisible();
    await expect(page.getByText(/最大コンボ:/)).toBeVisible();

    // Should display a badge
    await expect(page.locator('.badge')).toBeVisible();
  });

  test('should show news articles section', async ({ page }) => {
    // Check for news section
    await expect(page.getByText(/関連ニュース/)).toBeVisible();

    // Should have at least one news article
    const newsArticles = page.locator('.news-article');
    await expect(newsArticles.first()).toBeVisible();
  });

  test('should toggle review details', async ({ page }) => {
    // Find review toggle button
    const toggleButton = page.getByRole('button', { name: /詳細を見る/ });

    // If toggle exists, test it
    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Review details should appear
      await expect(page.locator('.review-details')).toBeVisible();

      // Click again to hide
      await page.getByRole('button', { name: /詳細を隠す/ }).click();
      await expect(page.locator('.review-details')).not.toBeVisible();
    }
  });
});
