void chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error: unknown) => {
    console.error('Failed to configure AI Web Scout side panel.', error);
  });
