import { extensionConfig } from '../config';

export async function openAnalysis(analysisId: string): Promise<void> {
  const url = `${extensionConfig.webAppUrl}/analyses/${encodeURIComponent(analysisId)}`;
  await chrome.tabs.create({ url });
}
