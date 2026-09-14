import { ACTORS, ROUTES } from '/shared/contracts.mjs';
import {
  controlledLandingScreen,
  controlledOrientationScreen,
  controlledPage1Main,
} from '/ui/controlled-entry.mjs';

function actorLabels() {
  return {
    new: ACTORS.new.label,
    returning: ACTORS.returning.label,
    professional: ACTORS.professional.label,
  };
}

function replaceLanding(root) {
  const screen = root.querySelector('main[data-screen="landing"]');
  if (!screen || screen.closest('[data-controlled-page="landing"]')) return false;
  screen.replaceWith(controlledLandingScreen(actorLabels()));
  return true;
}

function replaceOrientation(root) {
  const screen = root.querySelector('main[data-screen="orientation"]');
  if (!screen || screen.closest('[data-controlled-page]')) return false;
  const actorId = screen.getAttribute('data-actor');
  const replacement = controlledOrientationScreen(actorId);
  if (!replacement) return false;
  screen.replaceWith(replacement);
  return true;
}

function replaceBegin(root) {
  const shell = root.querySelector('.app-shell[data-screen="begin"]');
  if (!shell || shell.closest('[data-controlled-entry="projects"]')) return false;
  const main = shell.querySelector('main.screen-begin');
  if (!main) return false;
  const switchDialog = main.querySelector('.switch-dialog[aria-labelledby="switch-title"]');
  const collisionDialog = main.querySelector('[data-collision-dialog="true"]');
  const replacement = controlledPage1Main({
    pendingSwitch: Boolean(switchDialog),
    pendingCollision: Boolean(collisionDialog),
    switchDialog,
    collisionDialog,
  });
  shell.replaceWith(replacement);
  return true;
}

function setHostMode(root) {
  const controlled = Boolean(root.querySelector('[data-controlled-page], [data-controlled-entry]'));
  root.classList.toggle('controlled-entry-host', controlled);
}

function decorate(root) {
  const changed = replaceLanding(root) || replaceOrientation(root) || replaceBegin(root);
  setHostMode(root);
  return changed;
}

function fallbackBack() {
  if (window.location.pathname === ROUTES.landing) return;
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.history.pushState({ path: ROUTES.landing }, '', ROUTES.landing);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function startControlledEntryLayer(root) {
  if (!root || root.dataset.controlledEntryLayer === 'true') return;
  root.dataset.controlledEntryLayer = 'true';

  root.addEventListener('click', (event) => {
    const historyBack = event.target.closest('[data-action="history-back"]');
    if (historyBack && root.contains(historyBack)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      fallbackBack();
      return;
    }
    const scrollTop = event.target.closest('[data-action="scroll-top"]');
    if (scrollTop && root.contains(scrollTop)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const windowSeat = event.target.closest('[data-action="open-window-seat-reference"]');
    if (windowSeat && root.contains(windowSeat)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent('stb:open-window-seat-reference'));
    }
  }, true);

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      decorate(root);
    });
  };

  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  schedule();
}
