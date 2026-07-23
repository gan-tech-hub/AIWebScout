import './styles.css';

const rootElement = document.querySelector<HTMLElement>('#launcher');
if (!rootElement) throw new Error('Launcher root was not found.');
const root: HTMLElement = rootElement;

root.innerHTML = `
  <div class="brand"><span>◈</span><div><small>AGENT SENSOR</small><strong>AI Web Scout</strong></div></div>
  <p>現在のページへ接続し、Side Panelを最新の状態に更新します。</p>
  <button id="open-panel">現在のページに接続 <span>→</span></button>
  <div id="message" role="status" aria-live="polite"></div>
`;

async function openPanel(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('#open-panel');
  const message = document.querySelector<HTMLElement>('#message');
  if (button) button.disabled = true;
  if (message) message.textContent = '準備しています…';

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id === undefined) throw new Error('Active tab was not found.');

    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: `sidepanel.html?tabId=${String(tab.id)}&session=${String(Date.now())}`,
      enabled: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });
    window.close();
  } catch {
    if (button) button.disabled = false;
    if (message) {
      message.textContent =
        'Side Panelを開けませんでした。ページを再読み込みしてください。';
    }
  }
}

document
  .querySelector('#open-panel')
  ?.addEventListener('click', () => void openPanel());
