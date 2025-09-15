import { SignedInPage } from "../utility/pageObjects";
import { test, expect } from "@playwright/test";
import { Page } from "@playwright/test";

test.describe('speakers tests', () => {
  let signedInPage: SignedInPage;

  test.beforeEach(async ({ page }) => {
    signedInPage = new SignedInPage(page);
  });

  test('two speakers', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'two speakers') test.skip();
    await signedInPage.RecordAudio(24000);
    // wait for transcription to complete
    await page.waitForTimeout(7000);
    await signedInPage.validateSummaryTextForTwoSpeakers();
    await signedInPage.cleanUp();
  });

  test('one speaker', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'one speaker') test.skip();
    await signedInPage.RecordAudio(14000);
    await page.waitForTimeout(7000);
    await signedInPage.validateSummaryTextForOneSpeaker();
    await signedInPage.cleanUp();
  });

  test('three speakers', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'three speakers') test.skip();
    await signedInPage.RecordAudio(30000);
    await page.waitForTimeout(7000);
    await signedInPage.validateSummaryTextForThreeSpeakers();
    await signedInPage.cleanUp();
  });
});
