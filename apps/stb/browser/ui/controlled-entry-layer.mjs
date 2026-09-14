import { ACTORS, ROUTES } from '/shared/contracts.mjs';
import {
  controlledLandingScreen,
  controlledOrientationScreen,
  controlledPage1Main,
} from '/ui/controlled-entry.mjs';

const CONTROLLED_STYLE = `
#app.controlled-entry-host{width:min(1040px,100%);margin:0 auto;padding:28px 20px 60px;color:#1c1917;font:15px/1.6 ui-sans-serif,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.controlled-page,.controlled-page-host{--bg:#faf9f7;--surface:#fff;--rail:#f4f2ef;--tint:#f6efe4;--border:#e3ded7;--border-accent:#d9c3a2;--text:#1c1917;--text-2:#57534e;--text-3:#8a8580;--accent:#7a4f22;color:var(--text)}
@media(prefers-color-scheme:dark){.controlled-page,.controlled-page-host{--bg:#16150f;--surface:#1e1c16;--rail:#191711;--tint:#262015;--border:#332f26;--border-accent:#4d4130;--text:#f2efe8;--text-2:#b4aea3;--text-3:#847d72;--accent:#e0ad74}}
.controlled-page{display:grid;grid-template-columns:1fr 172px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface);margin-bottom:24px}
.controlled-page .main{padding:28px 26px;border-right:1px solid var(--border);min-width:0}.controlled-page .split{display:flex;min-width:0;border-right:1px solid var(--border)}
.controlled-page h1{margin:0 0 12px;font-size:25px;line-height:1.2;letter-spacing:-.01em}.controlled-page h2{margin:0 0 12px;font-size:18px}.controlled-page h3{margin:0 0 5px;font-size:16px}.controlled-page p{margin:0 0 12px}.controlled-page .sub{margin:0 0 22px;color:var(--text-2)}.controlled-page .dim{color:var(--text-2)}.controlled-page .strong-text{color:var(--text)}.controlled-page b{font-weight:600}.controlled-page .verb b{display:block}.controlled-page ul{margin:0 0 10px;padding-left:18px;color:var(--text-2)}.controlled-page li{margin-bottom:2px}
.controlled-page .btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;max-width:none}.controlled-page button{appearance:none;font:inherit;font-size:13px;min-height:auto;padding:8px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);cursor:pointer;text-align:left;width:auto}.controlled-page button:hover{border-color:var(--text-3)}
.controlled-page .you-build{font-weight:600;font-size:16px;margin:0 0 24px}.controlled-page .starting-label{font-size:13px;font-weight:600;letter-spacing:.05em;color:var(--text-2);margin:0}.controlled-page .orientation-trailing{margin-top:18px}.controlled-page .orientation-lead{margin-bottom:24px}.controlled-page .orientation-section-sub{margin-bottom:14px}
.controlled-page .rail{background:var(--rail);padding:24px 14px 16px;display:flex;flex-direction:column}.controlled-page .rail .hd{font-size:10px;font-weight:600;letter-spacing:.08em;color:var(--text-3);margin:0 0 24px}.controlled-page .rail .goal{font-size:13px;font-weight:600;margin:0 0 30px}.controlled-page .rail .row{margin:0 0 28px}.controlled-page .rail .row:last-of-type{margin-bottom:16px}.controlled-page .rail .row b{display:block;font-size:13px;margin-bottom:3px}.controlled-page .rail .row span{font-size:11.5px;line-height:1.45;color:var(--text-2)}.controlled-page .rail .foot{margin-top:auto;padding-top:13px;border-top:1px solid var(--border);display:flex;flex-direction:column;align-items:flex-end}
.controlled-page .ghpill{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:11.5px;font-weight:600;padding:5px 13px 5px 10px;border-radius:999px;cursor:pointer;border:1.5px solid var(--accent);background:var(--surface);color:var(--accent);text-decoration:none;white-space:nowrap}.controlled-page .ghpill:hover{background:var(--tint)}.controlled-page .ghpill svg{width:13px;height:13px;flex:none}
.controlled-page .ribbon{width:128px;flex:none;border-right:1px solid var(--border);background:var(--rail);padding:14px 10px;display:flex;flex-direction:column;gap:12px}.controlled-page .project-door{display:block;width:100%;padding:0;border:0;border-radius:0;background:transparent;text-align:left}.controlled-page .project-door:hover{border:0}.controlled-page .tile svg{width:100%;display:block;border-radius:9px;border:1px solid var(--border)}.controlled-page .tile.first svg{border:1px solid var(--border-accent)}.controlled-page .tile .t1{display:block;margin:5px 0 0;font-size:11px;font-weight:600;line-height:1.2}.controlled-page .tile.first .t1{color:var(--accent)}.controlled-page .tile .t2{display:block;margin:1px 0 0;font-size:9.5px;line-height:1.25;color:var(--text-3)}.controlled-page .ribbonbody{padding:18px;min-width:0}.controlled-page .project-heading{font-size:21px;margin-bottom:14px}.controlled-page .project-look-first,.controlled-page .project-say-no{margin-bottom:20px}.controlled-page .project-door-intro{margin-bottom:7px}.controlled-page .project-miss{margin-bottom:0}
.controlled-page .pagenav{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:22px;padding-top:14px;border-top:1px solid var(--border)}.controlled-page .pagenav button{font-size:12px;padding:6px 13px}.controlled-page .pagenav .where{margin-left:auto;font-size:10.5px;color:var(--text-3)}.controlled-page-host>.switch-dialog{width:min(640px,100%);margin:0 auto 24px}
@media(max-width:760px){#app.controlled-entry-host{padding:18px 12px 40px}.controlled-page{grid-template-columns:1fr}.controlled-page .main,.controlled-page .split{border-right:0;border-bottom:1px solid var(--border)}.controlled-page .rail .row,.controlled-page .rail .goal{margin-bottom:16px}}
`;

function installStyle() {
  if (document.getElementById('stb-controlled-entry-style')) return;
  const style = document.createElement('style');
  style.id = 'stb-controlled-entry-style';
  style.textContent = CONTROLLED_STYLE;
  document.head.append(style);
}

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

function keepReadmeOnly(root) {
  root.querySelectorAll('[data-build-guide] .foot p').forEach((item) => item.remove());
}

function decorate(root) {
  const changed = replaceLanding(root) || replaceOrientation(root) || replaceBegin(root);
  keepReadmeOnly(root);
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
  installStyle();

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
