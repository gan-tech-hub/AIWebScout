import type { CapturePageInput } from '@ai-web-scout/shared';
import { ExtensionError } from '../api/errors';
import { normalizeCapture, type RawPageCapture } from './sanitize';

function readPage(): RawPageCapture {
  const body = document.body;
  if (!body) throw new Error('ページ本文が見つかりません。');

  const clone = body.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      'input, textarea, select, option, [contenteditable], script, style, noscript, template',
    )
    .forEach((element) => element.remove());

  const selection = window.getSelection();
  let selectedText = '';
  if (selection && selection.rangeCount > 0) {
    const container = selection.getRangeAt(0).commonAncestorContainer;
    const element =
      container.nodeType === Node.ELEMENT_NODE
        ? (container as Element)
        : container.parentElement;
    const isEditableSelection = element?.closest(
      'input, textarea, select, [contenteditable]',
    );
    if (!isEditableSelection) selectedText = selection.toString();
  }

  return {
    title: document.title,
    url: window.location.href,
    pageText: clone.innerText || clone.textContent || '',
    selectedText,
    metaDescription:
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content ?? '',
    capturedAt: new Date().toISOString(),
  };
}

export function isCapturableUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function describeCaptureFailure(error: unknown): {
  code: string;
  message: string;
} {
  const reason = error instanceof Error ? error.message : String(error);
  const normalized = reason.toLowerCase();

  if (
    normalized.includes('cannot access contents') ||
    normalized.includes('missing host permission') ||
    normalized.includes('cannot access a chrome')
  ) {
    return {
      code: 'SCRIPT_PERMISSION_DENIED',
      message:
        'Chromeからページ読み取り権限を受け取れませんでした。拡張機能アイコンから開き直してください。',
    };
  }
  if (
    normalized.includes('frame was removed') ||
    normalized.includes('no tab with id')
  ) {
    return {
      code: 'TAB_CHANGED_DURING_CAPTURE',
      message:
        '取得中にページが切り替わりました。読み込み完了後にもう一度お試しください。',
    };
  }
  if (normalized.includes('extensions gallery cannot be scripted')) {
    return {
      code: 'RESTRICTED_CHROME_PAGE',
      message: 'Chrome Web Storeなどの保護されたページは取得できません。',
    };
  }
  return {
    code: 'SCRIPT_EXECUTION_FAILED',
    message: 'ページ内の読み取り処理を実行できませんでした。',
  };
}

export async function captureActiveTab(
  requestedTabId?: number | null,
): Promise<CapturePageInput> {
  const tabId =
    requestedTabId ??
    (
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      })
    )[0]?.id;
  if (tabId === undefined) {
    throw new ExtensionError(
      'CAPTURE_FAILED',
      'アクティブなタブを確認できませんでした。',
    );
  }

  try {
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId },
      func: readPage,
      world: 'ISOLATED',
    });
    if (!execution?.result) {
      throw new ExtensionError(
        'CAPTURE_FAILED',
        'このページから情報を取得できませんでした。',
      );
    }
    if (!isCapturableUrl(execution.result.url)) {
      throw new ExtensionError(
        'CAPTURE_BLOCKED',
        'このページはChromeの制限により取得できません。HTTPまたはHTTPSのページでお試しください。',
      );
    }
    return normalizeCapture(execution.result);
  } catch (error: unknown) {
    if (error instanceof ExtensionError) throw error;
    const failure = describeCaptureFailure(error);
    if (failure.code === 'SCRIPT_EXECUTION_FAILED') {
      console.error('AI Web Scout capture failed unexpectedly.', error);
    }
    throw new ExtensionError(
      'CAPTURE_FAILED',
      `${failure.message} [${failure.code}]`,
      {
        diagnosticCode: failure.code,
        chromeMessage: error instanceof Error ? error.message : String(error),
      },
    );
  }
}
