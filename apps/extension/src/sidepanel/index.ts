import type { CapturePageInput } from '@ai-web-scout/shared';
import { captureActiveTab } from '../capture/capture-active-tab';
import './styles.css';

const appElement = document.querySelector<HTMLElement>('#app');
if (!appElement) throw new Error('Side Panel root was not found.');
const app: HTMLElement = appElement;

let capturedPage: CapturePageInput | null = null;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character] ?? character;
  });
}

function render(status = '現在のページを確認してから送信できます。'): void {
  app.innerHTML = `
    <header><div class="mark">✦</div><div><p class="eyebrow">AGENT SENSOR</p><h1>AI Web Scout</h1></div></header>
    <section class="hero"><span class="pulse"></span><div><strong>Capture ready</strong><p>${escapeHtml(status)}</p></div></section>
    <section class="panel">
      <div class="label">PAGE SIGNAL</div>
      ${
        capturedPage
          ? `
        <h2>${escapeHtml(capturedPage.title)}</h2>
        <a href="${escapeHtml(capturedPage.url)}" target="_blank" rel="noreferrer">${escapeHtml(capturedPage.url)}</a>
        <dl><div><dt>Page text</dt><dd>${capturedPage.pageText.length.toLocaleString()} chars</dd></div><div><dt>Selection</dt><dd>${capturedPage.selectedText.length.toLocaleString()} chars</dd></div></dl>
        <details><summary>取得内容を確認</summary><p>${escapeHtml(capturedPage.selectedText || capturedPage.pageText.slice(0, 2500) || '本文は空です。')}</p></details>
      `
          : '<div class="empty">ページを読み取ると、送信対象の内容がここに表示されます。</div>'
      }
    </section>
    <div id="message" role="status" aria-live="polite"></div>
    <div class="actions"><button id="capture" class="secondary">ページを読み取る</button><button id="analyze" ${capturedPage ? '' : 'disabled'}>AIで分析 <span>↗</span></button></div>
    <p class="privacy">フォーム、編集領域、HTMLは取得しません。送信前に内容を確認できます。</p>
  `;

  document
    .querySelector('#capture')
    ?.addEventListener('click', () => void handleCapture());
  document
    .querySelector('#analyze')
    ?.addEventListener('click', handleAnalyzePlaceholder);
}

async function handleCapture(): Promise<void> {
  const message = document.querySelector<HTMLElement>('#message');
  if (message) message.textContent = 'ページを安全に読み取っています…';
  try {
    capturedPage = await captureActiveTab();
    render('取得内容を確認しました。分析を開始できます。');
  } catch (error: unknown) {
    render(
      error instanceof Error ? error.message : 'ページ取得に失敗しました。',
    );
  }
}

function handleAnalyzePlaceholder(): void {
  const message = document.querySelector<HTMLElement>('#message');
  if (message) message.textContent = 'API接続はフェーズ4〜6で有効になります。';
}

render();
