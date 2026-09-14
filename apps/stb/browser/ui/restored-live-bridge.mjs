const root = document.getElementById('app');

function moveLivePanels() {
  if (!root) return;
  const screen = root.querySelector('main[data-screen="questions"]');
  if (!screen) return;
  const live = screen.querySelector('[data-restored-surface] [data-rx-live]');
  if (!live) return;
  const config = screen.querySelector(':scope > [data-project-configurator]');
  if (config && !live.contains(config)) live.prepend(config);
  for (const selector of ['.source-pane', '.candidate-pane', '.needs-pane', '.child-panel']) {
    const node = screen.querySelector(`:scope > ${selector}`);
    if (node && !live.contains(node)) live.append(node);
  }
}

if (root) {
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      moveLivePanels();
    });
  };
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  schedule();
}
