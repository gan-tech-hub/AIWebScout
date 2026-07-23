import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  captureActiveTab,
  describeCaptureFailure,
  isCapturableUrl,
} from './capture-active-tab';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isCapturableUrl', () => {
  it.each([
    ['https://example.com/article', true],
    ['http://localhost:3000', true],
    ['chrome://extensions', false],
    ['file:///C:/secret.txt', false],
    ['not a url', false],
  ])('validates %s', (url, expected) => {
    expect(isCapturableUrl(url)).toBe(expected);
  });

  it('captures by tab ID even when Chrome does not expose tab.url', async () => {
    const query = vi.fn().mockResolvedValue([{ id: 42 }]);
    const executeScript = vi.fn().mockResolvedValue([
      {
        result: {
          title: 'Yahoo! JAPAN',
          url: 'https://www.yahoo.co.jp/',
          pageText: 'Page content',
          selectedText: '',
          metaDescription: '',
          capturedAt: '2026-07-23T00:00:00.000Z',
        },
      },
    ]);
    vi.stubGlobal('chrome', {
      tabs: { query },
      scripting: { executeScript },
    });

    const capture = await captureActiveTab();

    expect(query).toHaveBeenCalledWith({
      active: true,
      lastFocusedWindow: true,
    });
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({ target: { tabId: 42 } }),
    );
    expect(capture.url).toBe('https://www.yahoo.co.jp/');
  });

  it('uses the Side Panel tab ID without querying another tab', async () => {
    const query = vi.fn();
    const executeScript = vi.fn().mockResolvedValue([
      {
        result: {
          title: 'Example',
          url: 'https://example.com/',
          pageText: 'Example Domain',
          selectedText: '',
          metaDescription: '',
          capturedAt: '2026-07-23T00:00:00.000Z',
        },
      },
    ]);
    vi.stubGlobal('chrome', {
      tabs: { query },
      scripting: { executeScript },
    });

    await captureActiveTab(88);

    expect(query).not.toHaveBeenCalled();
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({ target: { tabId: 88 } }),
    );
  });

  it('classifies Chrome permission errors without exposing a URL', () => {
    expect(
      describeCaptureFailure(
        new Error(
          'Cannot access contents of url "https://private.example/path". Missing host permission.',
        ),
      ),
    ).toEqual({
      code: 'SCRIPT_PERMISSION_DENIED',
      message:
        'Chromeからページ読み取り権限を受け取れませんでした。拡張機能アイコンから開き直してください。',
    });
  });

  it('does not log an expected permission expiry as an extension error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal('chrome', {
      tabs: { query: vi.fn() },
      scripting: {
        executeScript: vi
          .fn()
          .mockRejectedValue(
            new Error(
              'Cannot access contents of the page. Missing host permission.',
            ),
          ),
      },
    });

    await expect(captureActiveTab(88)).rejects.toMatchObject({
      details: { diagnosticCode: 'SCRIPT_PERMISSION_DENIED' },
    });
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
