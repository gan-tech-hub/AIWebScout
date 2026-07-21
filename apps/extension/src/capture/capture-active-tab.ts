import type { CapturePageInput } from '@ai-web-scout/shared';
import { normalizeCapture, type RawPageCapture } from './sanitize';

function readPage(): RawPageCapture {
  const clone = document.body.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      'input, textarea, select, [contenteditable], script, style, noscript',
    )
    .forEach((element) => element.remove());

  return {
    title: document.title,
    url: window.location.href,
    pageText: clone.innerText,
    selectedText: window.getSelection()?.toString() ?? '',
    metaDescription:
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content ?? '',
    capturedAt: new Date().toISOString(),
  };
}

export async function captureActiveTab(): Promise<CapturePageInput> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined)
    throw new Error('アクティブなタブを確認できませんでした。');

  const [execution] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readPage,
  });
  if (!execution?.result)
    throw new Error('このページから情報を取得できませんでした。');
  return normalizeCapture(execution.result);
}
