import { expect, Page } from "@playwright/test";

export class SignedInPage {
  constructor(private page: Page) {
    this.page = page;
  }
  //change this later to be dynamic bsaed on wav file
  async RecordAudio(audioLengthMS: number){
    await this.page.goto('https://app.limitless.ai/r');
    await this.page.getByRole('button', { name: 'New Meeting Recording', exact: true }).click();
    const record = this.page.getByRole('button', { name: /^Record$/ });
    await expect(record).toBeVisible();
    await expect(record).toBeEnabled();
    await record.click();
    const stop = this.page.getByRole('button', { name: 'Stop', exact: true });
    try {
      await expect(stop).toBeVisible({ timeout: 7000 });
    } catch {
      await record.click({ force: true });
      await expect(stop).toBeVisible({ timeout: 7000 });
    }
    await this.page.waitForTimeout(audioLengthMS);
    await stop.click();
    await expect(this.page.getByRole('button', { name: 'Record', exact: true })).toBeVisible();
  }
  async validateSummaryTextForTwoSpeakers(){
    const section = this.page.locator('div:has(h2:has-text("Notes and Observations"))').first();
    const text = await section.textContent();
    const transcriptTab = this.page.getByRole('tab', { name: 'Transcript' });
    const transcriptPanel = this.page.getByRole('tabpanel', { name: /Transcript/i });
    const requiredWords = [ "walk", "coffee", "project"];
    for (const word of requiredWords) {
      expect(text).toContain(word);
    }
    await transcriptTab.click();
    await expect(transcriptPanel).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 1\b/).first()).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 2\b/).first()).toBeVisible();
  }
  async validateSummaryTextForOneSpeaker(){
    const section = this.page.locator('div:has(h2:has-text("Notes and Observations"))').first();
    const text = await section.textContent();
    const transcriptTab = this.page.getByRole('tab', { name: 'Transcript' });
    const transcriptPanel = this.page.getByRole('tabpanel', { name: /Transcript/i });
    const requiredWords = [ "walk", "coffee"];
    for (const word of requiredWords) {
      expect(text).toContain(word);
    }
    await transcriptTab.click();
    await expect(transcriptPanel).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 1\b/)).toBeVisible();
  }
  async validateSummaryTextForThreeSpeakers(){
    const section = this.page.locator('div:has(h2:has-text("Notes and Observations"))').first();
    const text = await section.textContent();
    const transcriptTab = this.page.getByRole('tab', { name: 'Transcript' });
    const transcriptPanel = this.page.getByRole('tabpanel', { name: /Transcript/i });
    const requiredWords = [ "walk", "coffee", "project"];
    for (const word of requiredWords) {
      expect(text).toContain(word);
    }
    await transcriptTab.click();
    await expect(transcriptPanel).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 1\b/).first()).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 2\b/).first()).toBeVisible();
    await expect(transcriptPanel.getByText(/\bSpeaker 3\b/).first()).toBeVisible();
  }
  async cleanUp(){
    const settingsButton = this.page.getByRole('button').filter({ hasText: /^$/ }).nth(1)
    const deleteOption = this.page.getByRole('menuitem', { name: 'Delete Meeting...' })
    const deleteButton = this.page.getByRole('button', { name: 'Delete' }).nth(1)
    const newMeetingRecordingButton = this.page.getByRole('button', { name: 'New Meeting Recording', exact: true })
    await settingsButton.click();
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(newMeetingRecordingButton).toBeVisible();


  }
}
export default SignedInPage;


