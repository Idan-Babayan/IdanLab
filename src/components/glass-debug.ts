// src/components/glass-debug.ts
//
// TEMPORARY (2026-10-25): the ?glassdebug readout, loaded by GlassDebug.astro only when the URL carries
// ?glassdebug. An investigation aid for the bar's glass, which clears after a theme switch or a return
// to Safari: it reads the two frost layers (header.header::before and the phone strip's
// mobile-starlight-toc nav::before), their animations and the page's state every 500ms and after each
// logged event. ?glassdebug=quiet skips the 500ms reads, in case reading computed style changes what it
// measures. It sits in the lower half of the screen; a tap moves it up under the bar and back, and
// reads again.
//
// It must not change what it measures: it adds no stylesheet (a new sheet makes WebKit rebuild its rule
// sets), styles only its own element, inline, rewrites one text node in place, and keeps off the
// screen's top and bottom edges, where Safari samples the colours for its own bars.
// Delete it, GlassDebug.astro and its line in the Head override when the investigation is done.

type Entry = { time: string; kind: string; text: string; count: number };

const EVENT_LOG = 8;
const EXTRA_LOG = 4;
const MEDIA: ReadonlyArray<[string, string]> = [
  ['(prefers-color-scheme: dark)', 'dark'],
  ['(prefers-reduced-motion: reduce)', 'rmotion'],
  ['(prefers-reduced-transparency: reduce)', 'rtransp'],
  ['(prefers-contrast: more)', 'contrast'],
];

const pad = (n: number, width = 2): string => String(n).padStart(width, '0');

const clock = (): string => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

// Computed colours carry six decimals, which would wrap every line on a phone; three are enough here.
const short = (value: string): string => value.replace(/(\d+\.\d{3})\d+/g, '$1');

// A scroll-driven animation's currentTime is a percentage (a CSSUnitValue), a time-based one milliseconds.
const formatTime = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return `${value.toFixed(0)}ms`;
  const unit = value as { value?: unknown; unit?: unknown };
  if (typeof unit.value === 'number') {
    return `${unit.value.toFixed(1)}${unit.unit === 'percent' ? '%' : String(unit.unit ?? '')}`;
  }
  return String(value);
};

export function start(): void {
  if (document.getElementById('glass-debug') !== null) return;

  const root = document.documentElement;
  const header = document.querySelector('header.header') as HTMLElement | null;
  const strip = document.querySelector('mobile-starlight-toc nav') as HTMLElement | null;
  const quiet = new URLSearchParams(window.location.search).get('glassdebug') === 'quiet';
  const events: Entry[] = [];
  const extra: Entry[] = [];
  let reads = 0;
  let atTop = false;
  let frame = 0;

  // Which build this is: the shared stylesheet's file name and the frost keyframes it carries.
  const build = ((): string => {
    let sheetName = '?';
    const keyframes: string[] = [];
    const walk = (list: CSSRuleList): void => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSKeyframesRule) {
          if (rule.name.startsWith('tp-frost')) keyframes.push(rule.name);
          continue;
        }
        const nested = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
        if (nested !== undefined) walk(nested);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      const href = sheet.href ?? '';
      if (href.includes('/_astro/common.')) sheetName = href.slice(href.lastIndexOf('/') + 1);
      try {
        walk(sheet.cssRules);
      } catch {
        // A sheet the page cannot read: nothing of ours.
      }
    }
    return `${sheetName} kf=${keyframes.join(',') || 'none'}`;
  })();

  const panel = document.createElement('div');
  panel.id = 'glass-debug';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('data-pagefind-ignore', '');
  const set = (property: string, value: string): void => panel.style.setProperty(property, value);
  set('position', 'fixed');
  set('left', '6px');
  set('right', '6px');
  set('z-index', '2147483647');
  set('box-sizing', 'border-box');
  set('max-height', 'calc(50svh - 88px)');
  set('overflow', 'auto');
  set('margin', '0');
  set('padding', '6px 8px');
  set('background', 'rgba(0, 0, 0, 0.93)');
  set('color', '#d6ffd6');
  set('border', '1px solid rgba(255, 255, 255, 0.25)');
  set('border-radius', '4px');
  set('font', '10px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace');
  set('letter-spacing', '0');
  set('text-transform', 'none');
  set('text-align', 'left');
  set('white-space', 'pre-wrap');
  set('word-break', 'break-all');
  set('contain', 'content');
  set('-webkit-user-select', 'none');
  set('user-select', 'none');
  // Anchored by its top edge in both places, so a longer log grows it downward and its box never moves:
  // anchored by the bottom it grew upward, and Chrome counted that as a layout shift. The height cap
  // keeps its foot 88px above the bottom of the smallest viewport, clear of Safari's bar.
  const place = (): void => {
    set('top', atTop ? 'calc(var(--sl-nav-height, 3.25rem) + var(--sl-mobile-toc-height, 0px) + 8px)' : '50svh');
  };
  place();
  const text = document.createTextNode('');
  panel.appendChild(text);

  const layer = (label: string, el: HTMLElement | null): string => {
    if (el === null) return `${label}: not on this page`;
    const cs = getComputedStyle(el, '::before');
    const mask = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') || '-';
    return [
      `${label}${el.getClientRects().length > 0 ? '' : ' (not rendered)'} bg ${short(cs.backgroundColor)} op ${cs.opacity}`,
      `  bf ${short(cs.getPropertyValue('backdrop-filter') || '-')} | -webkit- ${short(cs.getPropertyValue('-webkit-backdrop-filter') || '-')}`,
      `  anim ${cs.animationName} --tp-frost ${cs.getPropertyValue('--tp-frost').trim() || '-'}` +
        ` mask ${mask.startsWith('linear-gradient') ? 'gradient' : mask} host ${short(getComputedStyle(el).backgroundColor)}`,
    ].join('\n');
  };

  const animations = (): string => {
    const all = document.getAnimations();
    const scrollTimeline = (window as unknown as { ScrollTimeline?: abstract new () => AnimationTimeline })
      .ScrollTimeline;
    const lines: string[] = [];
    for (const animation of all) {
      const effect = animation.effect as KeyframeEffect | null;
      const target = effect?.target ?? null;
      if (target === null || (target !== header && target !== strip && target.localName !== 'mobile-starlight-toc')) continue;
      const where = `${target === header ? 'bar' : 'strip'}${effect?.pseudoElement ?? ''}`;
      const name =
        typeof CSSAnimation !== 'undefined' && animation instanceof CSSAnimation
          ? animation.animationName
          : typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition
            ? `transition ${animation.transitionProperty}`
            : animation.id || 'animation';
      const timeline = animation.timeline;
      const kind =
        timeline === null
          ? 'no timeline'
          : scrollTimeline !== undefined && timeline instanceof scrollTimeline
            ? 'ScrollTimeline'
            : timeline.constructor.name;
      const progress = effect?.getComputedTiming().progress;
      lines.push(
        `  ${where} ${name} ${animation.playState} t=${formatTime(animation.currentTime)} ` +
          `p=${typeof progress === 'number' ? progress.toFixed(2) : '-'} ${kind}`,
      );
    }
    return [`anims ${lines.length} on bar/strip, ${all.length} on page`, ...lines].join('\n');
  };

  const state = (): string => {
    const media = MEDIA.map(([query, label]) => `${label}=${window.matchMedia(query).matches ? 1 : 0}`).join(' ');
    return [
      `html theme=${root.dataset.theme ?? '-'} class="${root.className}" style="${root.getAttribute('style') ?? ''}"` +
        ` cs=${getComputedStyle(root).colorScheme}`,
      `header class="${header?.className ?? '-'}" style="${header?.getAttribute('style') ?? ''}"`,
      `y=${Math.round(window.scrollY)} vis=${document.visibilityState} ${window.innerWidth}x${window.innerHeight}` +
        ` media ${media}`,
    ].join('\n');
  };

  const entries = (list: Entry[]): string[] =>
    list.map((e) => ` ${e.time} ${e.kind}${e.text ? ` ${e.text}` : ''}${e.count > 1 ? ` (x${e.count})` : ''}`);

  const render = (): void => {
    reads += 1;
    text.nodeValue = [
      `GLASS ${clock()} read ${reads}${quiet ? ' quiet' : ''} | ${build}`,
      layer('bar::before', header),
      layer('strip::before', strip),
      animations(),
      state(),
      `events (last ${EVENT_LOG}):`,
      ...entries(events),
      `extra (last ${EXTRA_LOG}):`,
      ...entries(extra),
    ].join('\n');
  };

  // Read now, and again once the browser has run the frame the event belongs to.
  const refresh = (): void => {
    render();
    if (frame === 0) {
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    }
  };

  const record = (list: Entry[], size: number, kind: string, detail: string): void => {
    const last = list[list.length - 1];
    if (kind === 'resize' && last !== undefined && last.kind === 'resize') {
      last.time = clock();
      last.text = detail;
      last.count += 1;
    } else {
      list.push({ time: clock(), kind, text: detail, count: 1 });
      if (list.length > size) list.shift();
    }
    refresh();
  };
  const logEvent = (kind: string, detail = ''): void => record(events, EVENT_LOG, kind, detail);
  const logExtra = (kind: string, detail = ''): void => record(extra, EXTRA_LOG, kind, detail);

  // The events asked for. The theme click is caught on the way down, before ThemeSelect's handler flips
  // the theme, so the entry carries the theme it left.
  document.addEventListener(
    'click',
    (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-theme-toggle]') !== null) {
        logEvent('theme click', `from ${root.dataset.theme ?? '-'}`);
      }
    },
    { capture: true },
  );
  window.addEventListener('pageshow', (event: PageTransitionEvent) => logEvent('pageshow', `persisted=${event.persisted}`));
  window.addEventListener('pagehide', (event: PageTransitionEvent) => logEvent('pagehide', `persisted=${event.persisted}`));
  document.addEventListener('visibilitychange', () => logEvent('visibilitychange', document.visibilityState));
  window.addEventListener('storage', (event: StorageEvent) => logEvent('storage', event.key ?? '(cleared)'));
  window.addEventListener('focus', () => logEvent('focus'));
  window.addEventListener('blur', () => logEvent('blur'));
  window.addEventListener('resize', () => logEvent('resize', `${window.innerWidth}x${window.innerHeight}`));

  // Two more signals, in their own log so they never push out the events above: a media query that
  // flips (iOS can re-render a backgrounded app in the other appearance for the app switcher), and any
  // attribute written on html, body, the header or the theme-color meta, with its old and new value.
  for (const [query, label] of MEDIA) {
    window.matchMedia(query).addEventListener('change', (event: MediaQueryListEvent) => {
      logExtra('media', `${label}=${event.matches ? 1 : 0}`);
    });
  }
  const watch = (el: Element | null, label: string): void => {
    if (el === null) return;
    new MutationObserver((records: MutationRecord[]) => {
      for (const change of records) {
        const name = change.attributeName ?? '?';
        logExtra('attr', `${label} ${name}: ${change.oldValue ?? '(none)'} -> ${el.getAttribute(name) ?? '(removed)'}`);
      }
    }).observe(el, { attributes: true, attributeOldValue: true });
  };
  watch(root, 'html');
  watch(document.body, 'body');
  watch(header, 'header');
  watch(document.querySelector('meta[name="theme-color"]'), 'meta');

  panel.addEventListener('click', () => {
    atTop = !atTop;
    place();
    render();
  });

  document.body.appendChild(panel);
  render();
  if (!quiet) window.setInterval(render, 500);
}
