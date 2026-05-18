import { expect, test } from '@playwright/test';

// Reference path through the content. Update these if the taxonomy changes.
const TOPIC_ID = 'intro-to-cs';
const TOPIC_NAME = 'Introduction to Computer Science';
const LESSON_URL = `/lesson/${TOPIC_ID}`;
const QUIZ_URL = `/quiz/${TOPIC_ID}`;
const QUIZ_LENGTH = 5;

/** If the "haven't read the lesson" disclaimer is up, dismiss it. */
async function dismissDisclaimerIfPresent(page: import('@playwright/test').Page) {
  const skip = page.getByRole('button', { name: /Skip lesson/ });
  await skip.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
}

/** Click option N on the current question. Targets the Nth button inside the
 *  options `<ol>`, which is the most robust locator for the new 2×2 grid. */
async function pickOption(
  page: import('@playwright/test').Page,
  index: number,
) {
  await page.locator('ol li button').nth(index).click();
}

test.describe('Critical user flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clean localStorage on the first navigation only — re-clearing on every
    // goto would wipe attempts mid-test.
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('home → quizzes → quiz → results', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /LANDMARK/ })).toBeVisible();

    // The new home is two tiles. Click "Browse quizzes".
    await page.getByRole('link', { name: /Browse quizzes/i }).click();
    await expect(page).toHaveURL(/\/quizzes$/);

    // Pick a specific topic from the quizzes grid.
    await page.getByRole('link', { name: new RegExp(TOPIC_NAME) }).click();
    await expect(page).toHaveURL(QUIZ_URL);

    await dismissDisclaimerIfPresent(page);

    // Answer every question. We pick option 1 each time — flow test, not score.
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      await expect(
        page.getByText(new RegExp(`QUESTION 0${i + 1}`)),
      ).toBeVisible();
      await pickOption(page, 0);
      await page.getByRole('button', { name: /CONFIRM/ }).click();
      await page
        .getByRole('button', {
          name: i === QUIZ_LENGTH - 1 ? /FINISH/ : /NEXT/,
        })
        .click();
    }

    await expect(page.getByText('Results', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to course' })).toBeVisible();
  });

  test('lesson page renders its body and attribution', async ({ page }) => {
    await page.goto(LESSON_URL);
    // Lesson body contains fenced code blocks rendered by react-markdown.
    await expect(page.locator('pre code').first()).toBeVisible();
    // Attribution paragraph at the bottom of the page.
    await expect(
      page.getByText(/Adapted from/).last(),
    ).toBeVisible();
  });

  test('quiz attempt persists across reloads', async ({ page }) => {
    await page.goto(QUIZ_URL);
    await dismissDisclaimerIfPresent(page);

    for (let i = 0; i < QUIZ_LENGTH; i++) {
      await pickOption(page, 0);
      await page.getByRole('button', { name: /CONFIRM/ }).click();
      await page
        .getByRole('button', {
          name: i === QUIZ_LENGTH - 1 ? /FINISH/ : /NEXT/,
        })
        .click();
    }

    await page.goto('/progress');
    await expect(
      page.getByRole('link', { name: new RegExp(TOPIC_NAME) }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('link', { name: new RegExp(TOPIC_NAME) }),
    ).toBeVisible();
  });
});
