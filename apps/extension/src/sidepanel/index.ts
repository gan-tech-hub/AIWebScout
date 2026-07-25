import type { CapturePageInput } from '@ai-web-scout/shared';
import { analyzeCaptureWithTimeout } from '../api/analyze-capture';
import { ExtensionError, toUserMessage } from '../api/errors';
import { openAnalysis } from '../api/open-analysis';
import { captureActiveTab } from '../capture/capture-active-tab';
import { extensionConfig } from '../config';
import './styles.css';

type ViewStatus =
  | 'idle'
  | 'capturing'
  | 'ready'
  | 'submitting'
  | 'success'
  | 'error'
  | 'auth'
  | 'reconnect';

type ViewState = {
  status: ViewStatus;
  capture: CapturePageInput | null;
  message: string;
};

const appElement = document.querySelector<HTMLElement>('#app');
if (!appElement) throw new Error('Side Panel root was not found.');
const app: HTMLElement = appElement;

const state: ViewState = {
  status: 'idle',
  capture: null,
  message: '現在のページを取得して、送信内容を確認できます。',
};
const tabIdValue = new URLSearchParams(window.location.search).get('tabId');
const parsedTabId = tabIdValue ? Number(tabIdValue) : Number.NaN;
const panelTabId =
  Number.isInteger(parsedTabId) && parsedTabId >= 0 ? parsedTabId : null;

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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusLabel(): string {
  switch (state.status) {
    case 'capturing':
      return 'Capturing';
    case 'submitting':
      return 'Sending';
    case 'success':
      return 'Sent';
    case 'error':
      return 'Needs attention';
    case 'auth':
      return 'Sign in required';
    case 'reconnect':
      return 'Reconnect required';
    case 'ready':
      return 'Review ready';
    default:
      return 'Sensor ready';
  }
}

function previewText(capture: CapturePageInput): string {
  return (
    capture.selectedText ||
    capture.pageText.slice(0, 2_500) ||
    '本文は空です。タイトルとメタ情報のみ送信されます。'
  );
}

function renderCapture(capture: CapturePageInput): string {
  return `
    <section class="capture-card">
      <div class="section-heading">
        <span class="section-label">PAGE SIGNAL</span>
        <span class="captured-at">${escapeHtml(formatDate(capture.capturedAt))}</span>
      </div>
      <h2>${escapeHtml(capture.title)}</h2>
      <a class="page-url" href="${escapeHtml(capture.url)}" target="_blank" rel="noreferrer">
        ${escapeHtml(capture.url)}
      </a>
      <div class="metrics">
        <div><span>Page text</span><strong>${capture.pageText.length.toLocaleString()}</strong><small>chars</small></div>
        <div><span>Selection</span><strong>${capture.selectedText.length.toLocaleString()}</strong><small>chars</small></div>
      </div>
      ${
        capture.metaDescription
          ? `<div class="meta"><span>META</span><p>${escapeHtml(capture.metaDescription)}</p></div>`
          : ''
      }
      <details>
        <summary><span>送信内容を確認</span><span class="chevron">⌄</span></summary>
        <p>${escapeHtml(previewText(capture))}</p>
      </details>
    </section>
  `;
}

function render(): void {
  const busy = state.status === 'capturing' || state.status === 'submitting';
  const canAnalyze = state.capture !== null && !busy;
  const tone =
    state.status === 'error'
      ? 'error'
      : state.status === 'success'
        ? 'success'
        : busy
          ? 'working'
          : '';

  app.innerHTML = `
    <header class="brand">
      <div class="mark" aria-hidden="true">◈</div>
      <div><p class="eyebrow">AGENT SENSOR</p><h1>AI Web Scout</h1></div>
      <span class="connection"><i></i> LOCAL</span>
    </header>

    <section class="status-card ${tone}">
      <div class="status-icon"><span class="pulse"></span></div>
      <div>
        <strong>${statusLabel()}</strong>
        <p id="status-message">${escapeHtml(state.message)}</p>
        ${
          state.status === 'reconnect'
            ? `<div class="reconnect-guide">
                <span>1</span><p>Chromeツールバーの<strong>AI Web Scout</strong>を押す</p>
                <span>2</span><p><strong>現在のページに接続</strong>を押す</p>
              </div>`
            : ''
        }
        ${
          state.status === 'auth'
            ? `<button id="open-login" class="inline-action">Webアプリでログイン</button>`
            : ''
        }
      </div>
    </section>

    ${
      state.capture
        ? renderCapture(state.capture)
        : `<section class="empty-state"><div class="radar"><span></span></div><strong>ページをスキャン</strong><p>表示中のページから、分析に必要なプレーンテキストだけを取得します。</p></section>`
    }

    <div class="actions">
      <button id="capture" class="secondary" ${busy ? 'disabled' : ''}>
        <span class="${state.status === 'capturing' ? 'spinner' : ''}">${state.status === 'capturing' ? '' : '↻'}</span>
        ${state.capture ? '再取得' : 'ページを取得'}
      </button>
      <button id="analyze" ${canAnalyze ? '' : 'disabled'}>
        <span class="${state.status === 'submitting' ? 'spinner' : ''}">${state.status === 'submitting' ? '' : '✦'}</span>
        ${state.status === 'submitting' ? '送信中' : 'AIで分析'}
      </button>
    </div>

    <div class="privacy">
      <span aria-hidden="true">◇</span>
      <p><strong>Privacy guard</strong>フォーム入力、編集領域、HTMLは取得しません。送信はボタン操作時のみ実行されます。</p>
    </div>
    <footer>CONNECTED TO <span>${escapeHtml(extensionConfig.webAppUrl)}</span></footer>
  `;

  document
    .querySelector('#capture')
    ?.addEventListener('click', () => void handleCapture());
  document
    .querySelector('#analyze')
    ?.addEventListener('click', () => void handleAnalyze());
  document.querySelector('#open-login')?.addEventListener('click', () => {
    void chrome.tabs.create({ url: `${extensionConfig.webAppUrl}/login` });
  });
}

async function handleCapture(): Promise<void> {
  state.status = 'capturing';
  state.message = 'ページ情報を安全に読み取っています…';
  render();
  try {
    state.capture = await captureActiveTab(panelTabId);
    state.status = 'ready';
    state.message = '取得内容を確認してから分析を開始してください。';
  } catch (error: unknown) {
    const needsReconnect =
      error instanceof ExtensionError &&
      error.details.diagnosticCode === 'SCRIPT_PERMISSION_DENIED';
    state.status = needsReconnect ? 'reconnect' : 'error';
    state.message = needsReconnect
      ? '別のサイトへ移動したため、現在のページへの読み取り許可が必要です。'
      : toUserMessage(error);
  }
  render();
}

async function handleAnalyze(): Promise<void> {
  if (!state.capture) return;
  state.status = 'submitting';
  state.message = 'Webアプリへ送信し、分析を準備しています…';
  render();
  try {
    const result = await analyzeCaptureWithTimeout(state.capture);
    state.status = 'success';
    state.message = '分析を開始しました。詳細画面を開きます。';
    render();
    await openAnalysis(result.analysisId);
  } catch (error: unknown) {
    state.status =
      error instanceof ExtensionError && error.code === 'UNAUTHORIZED'
        ? 'auth'
        : 'error';
    state.message = toUserMessage(error);
    render();
  }
}

render();
