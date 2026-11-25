// Swarm Rebuild — Authentic Full-Page Multi-Agent UI/UX Build Replay
// Blank-canvas → Wireframe → Live UI with 14-18 cursors, I-beam typing,
// 60fps fast-brake cursor physics, full-viewport distribution, Touring scroll,
// 1x/2x/3x speed (live, no restart), and Web Audio SFX.

(function () {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────
  const MIN_AGENTS = 14;
  const MAX_AGENTS = 18;
  const INTRO_DUR  = 1700; // ms blank-canvas "thinking" intro

  const AGENT_COLORS = [
    '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
    '#10b981','#06b6d4','#f43f5e','#6366f1',
    '#14b8a6','#a855f7','#f97316','#22c55e',
    '#0ea5e9','#e879f9','#fb923c','#4ade80',
    '#c084fc','#38bdf8'
  ];
  const AGENT_NAMES = [
    'Layout-AI','UI-Core','Type-Bot','Grid-Sys',
    'Style-V3','Hero-Bot','Card-AI','Nav-Bot',
    'Motion-1','Bento-AI','DOM-Sync','Pixel-QA',
    'Rim-FX','Flex-Bot','Meta-AI','Wire-AI',
    'Font-Bot','Deploy-1'
  ];

  // ─── Layer Definitions (300+ layers via expand) ───────────────────────────
  const LAYER_QUERY = [
    // ── Header ──
    { sel: 'header',                                              label: 'HeaderBar',        type: 'box' },
    { sel: 'header a.group',                                      label: 'BrandLogo',        type: 'box' },
    { sel: 'header nav a',                                        label: 'NavLink',          type: 'text' },
    { sel: 'header .hidden.md\\:flex > a',                        label: 'HeaderBtn',        type: 'box' },
    { sel: 'header .hidden.md\\:flex',                            label: 'HeaderActions',    type: 'box' },
    // ── Hero ──
    { sel: '#hero',                                               label: 'HeroSection',      type: 'box' },
    { sel: '#hero .inline-flex.rounded-full',                     label: 'StudentBadge',     type: 'box' },
    { sel: '#hero .font-handwriting',                             label: 'Greeting',         type: 'text' },
    { sel: '#hero h1',                                            label: 'HeroTitle',        type: 'text' },
    { sel: '#hero h2',                                            label: 'RoleTitle',        type: 'text' },
    { sel: '#hero p.text-gray-300',                               label: 'HeroBio',          type: 'box' },
    { sel: '#hero .font-display.font-black.tracking-tighter',     label: 'PortfolioBg',      type: 'box' },
    { sel: '#hero img[alt*="Tr"]',                                label: 'PortraitCutout',   type: 'box' },
    { sel: '#hero a[href="#works"]',                              label: 'PrimaryCTA',       type: 'box' },
    { sel: '#hero a[href*="github.com"]',                         label: 'GitHubCTA',        type: 'box' },
    { sel: '#hero .flex.flex-wrap.items-center.gap-5',            label: 'QuickContact',     type: 'box' },
    { sel: '#hero .flex.flex-wrap.items-center.gap-5 > *',        label: 'ContactItem',      type: 'box' },
    { sel: '#hero .md\\:col-span-2 > a',                          label: 'HeroStat',         type: 'box' },
    { sel: '#hero [class*="stat"]',                               label: 'StatItem',         type: 'box' },
    { sel: '#hero .grid > *',                                     label: 'HeroGridCell',     type: 'box' },
    // ── Bento Hub ──
    { sel: 'section.bg-\\[\\#0b0c10\\]',                          label: 'BentoSection',     type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2',                       label: 'BentoHeading',     type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6',         label: 'BentoCard',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7',         label: 'TechMatrix',       type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5',         label: 'StudioClock',      type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] [class*="col-span"]',      label: 'BentoCell',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] p',                        label: 'BentoPara',        type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] span',                     label: 'BentoSpan',        type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] img',                      label: 'BentoImg',         type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] button',                   label: 'BentoBtn',         type: 'box' },
    // ── Works / Projects ──
    { sel: '#works',                                              label: 'WorksSection',     type: 'box' },
    { sel: '#works h2',                                           label: 'WorksTitle',       type: 'text' },
    { sel: '#works > *',                                          label: 'WorksRow',         type: 'box' },
    { sel: '#project-filters',                                    label: 'FilterBar',        type: 'box' },
    { sel: '#project-filters button',                             label: 'FilterTab',        type: 'box' },
    { sel: '#projects-grid',                                      label: 'ProjectsGrid',     type: 'box' },
    { sel: '#projects-grid .project-card',                        label: 'ProjectCard',      type: 'box' },
    { sel: '#projects-grid .project-card h3',                     label: 'CardTitle',        type: 'text' },
    { sel: '#projects-grid .project-card p',                      label: 'CardDesc',         type: 'text' },
    { sel: '#projects-grid .project-card a',                      label: 'CardLink',         type: 'box' },
    { sel: '#projects-grid .project-card [class*="tag"]',         label: 'CardTag',          type: 'box' },
    { sel: '#projects-grid .project-card img',                    label: 'CardImg',          type: 'box' },
    { sel: '#projects-grid .project-card [class*="badge"]',       label: 'CardBadge',        type: 'box' },
    { sel: '#projects-grid .project-card footer',                 label: 'CardFooter',       type: 'box' },
    { sel: '#projects-grid .project-card header',                 label: 'CardHeader',       type: 'box' },
    // ── Services / Chuyên Môn ──
    { sel: '#services',                                           label: 'ServicesSection',  type: 'box' },
    { sel: '#services h2',                                        label: 'ServicesTitle',    type: 'text' },
    { sel: '#services > *',                                       label: 'ServicesRow',      type: 'box' },
    { sel: '#services .accordion-item',                           label: 'TechAccordion',    type: 'box' },
    { sel: '#services .accordion-item h3',                        label: 'AccordionTitle',   type: 'text' },
    { sel: '#services .accordion-item p',                         label: 'AccordionBody',    type: 'text' },
    { sel: '#services [class*="badge"]',                          label: 'SkillBadge',       type: 'box' },
    { sel: '#services [class*="tag"]',                            label: 'SkillTag',         type: 'box' },
    { sel: '#services button',                                    label: 'AccordionBtn',     type: 'box' },
    // ── Docs / Architecture ──
    { sel: '#docs',                                               label: 'DocsSection',      type: 'box' },
    { sel: '#docs h2',                                            label: 'DocsTitle',        type: 'text' },
    { sel: '#docs .space-y-4 > div',                              label: 'ArchitectureDoc',  type: 'box' },
    { sel: '#docs .space-y-4 > div h3',                           label: 'DocTitle',         type: 'text' },
    { sel: '#docs .space-y-4 > div p',                            label: 'DocPara',          type: 'text' },
    { sel: '#docs .space-y-4 > div a',                            label: 'DocLink',          type: 'box' },
    { sel: '#docs [class*="card"]',                               label: 'DocCard',          type: 'box' },
    { sel: '#docs img',                                           label: 'DocImg',           type: 'box' },
    // ── About ──
    { sel: '#about',                                              label: 'AboutSection',     type: 'box' },
    { sel: '#about h2',                                           label: 'AboutTitle',       type: 'text' },
    { sel: '#about .lg\\:col-span-6',                             label: 'AboutColumn',      type: 'box' },
    { sel: '#about .lg\\:col-span-6 > *',                         label: 'AboutChild',       type: 'box' },
    { sel: '#about p',                                            label: 'AboutPara',        type: 'text' },
    { sel: '#about h3',                                           label: 'AboutSubtitle',    type: 'text' },
    { sel: '#about [class*="card"]',                              label: 'AboutCard',        type: 'box' },
    { sel: '#about [class*="list"]',                              label: 'AboutList',        type: 'box' },
    { sel: '#about li',                                           label: 'AboutListItem',    type: 'box' },
    { sel: '#about img',                                          label: 'AboutImg',         type: 'box' },
    { sel: '#about a',                                            label: 'AboutLink',        type: 'box' },
    // ── Journey / Timeline ──
    { sel: '#journey',                                            label: 'JourneySection',   type: 'box' },
    { sel: '#journey h2',                                         label: 'JourneyTitle',     type: 'text' },
    { sel: '#journey .space-y-6 > div',                           label: 'TimelineItem',     type: 'box' },
    { sel: '#journey .space-y-6 > div h3',                        label: 'TimelineTitle',    type: 'text' },
    { sel: '#journey .space-y-6 > div p',                         label: 'TimelinePara',     type: 'text' },
    { sel: '#journey .space-y-6 > div [class*="badge"]',          label: 'TimelineBadge',   type: 'box' },
    { sel: '#journey .space-y-6 > div [class*="tag"]',            label: 'TimelineTag',     type: 'box' },
    { sel: '#journey .space-y-6 > div a',                         label: 'TimelineLink',     type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\]',                        label: 'ResumeCard',       type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\] h3',                     label: 'ResumeTitle',      type: 'text' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\] p',                      label: 'ResumePara',       type: 'text' },
    { sel: '#journey [class*="line"]',                            label: 'TimelineLine',     type: 'box' },
    { sel: '#journey [class*="dot"]',                             label: 'TimelineDot',      type: 'box' },
    // ── Contact ──
    { sel: '#contact',                                            label: 'ContactSection',   type: 'box' },
    { sel: '#contact h2',                                         label: 'ContactTitle',     type: 'text' },
    { sel: '#contact p',                                          label: 'ContactPara',      type: 'text' },
    { sel: '#contact #copy-email-btn',                            label: 'EmailCopyCard',    type: 'box' },
    { sel: '#contact-form',                                       label: 'ContactForm',      type: 'box' },
    { sel: '#contact-form input',                                 label: 'FormInput',        type: 'box' },
    { sel: '#contact-form textarea',                              label: 'FormTextarea',     type: 'box' },
    { sel: '#contact-form button[type="submit"]',                 label: 'FormSubmit',       type: 'box' },
    { sel: '#contact-form label',                                 label: 'FormLabel',        type: 'text' },
    { sel: '#contact [class*="social"]',                          label: 'SocialLink',       type: 'box' },
    { sel: '#contact [class*="card"]',                            label: 'ContactCard',      type: 'box' },
    // ── Footer ──
    { sel: 'footer',                                              label: 'Footer',           type: 'box' },
    { sel: 'footer p',                                            label: 'FooterPara',       type: 'text' },
    { sel: 'footer a',                                            label: 'FooterLink',       type: 'box' },
    { sel: 'footer [class*="social"]',                            label: 'FooterSocial',     type: 'box' },
    // ── Generic sweeps ──
    { sel: 'main > section > h2',                                 label: 'SectionH2',        type: 'text' },
    { sel: 'main > section > h3',                                 label: 'SectionH3',        type: 'text' },
    { sel: 'main > section > p',                                  label: 'SectionPara',      type: 'text' },
    { sel: '[class*="card"] h3',                                  label: 'CardH3',           type: 'text' },
    { sel: '[class*="card"] p',                                   label: 'CardPara',         type: 'text' },
    { sel: '[class*="card"] > div',                               label: 'CardDiv',          type: 'box' },
    { sel: '[class*="badge"]',                                    label: 'BadgeEl',          type: 'box' },
    { sel: '[class*="tag"]',                                      label: 'TagEl',            type: 'box' },
    { sel: '[class*="pill"]',                                     label: 'PillEl',           type: 'box' },
    { sel: '[class*="btn"]',                                      label: 'BtnEl',            type: 'box' },
    { sel: 'svg[class*="icon"]',                                  label: 'IconEl',           type: 'box' },
    { sel: '[class*="separator"]',                                label: 'Separator',        type: 'box' },
    { sel: '[class*="divider"]',                                  label: 'Divider',          type: 'box' },
    { sel: '[class*="grid"] > *',                                 label: 'GridCell',         type: 'box' },
  ];

  // ─── State ───────────────────────────────────────────────────────────────
  let isReplaying    = false;
  let touringEnabled = true;
  let soundEnabled   = false;
  let speedMultiplier = 1;
  let replayTimers   = [];
  let rafId          = null;
  let audioCtx       = null;
  let savedHTMLMap   = new Map();

  // ─── Audio ───────────────────────────────────────────────────────────────
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  }
  function playTone(freq, dur, vol = 0.03, type = 'sine') {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }
  function playWireframeSound() { playTone(520 + Math.random() * 140, 0.04, 0.02, 'triangle'); }
  function playTypeSound()      { playTone(780 + Math.random() * 200, 0.025, 0.015, 'square'); }
  function playSnapSound()      { playTone(380 + Math.random() * 180, 0.05, 0.025, 'sine'); }
  function playCompleteSound() {
    if (!soundEnabled) return;
    setTimeout(() => playTone(523.25, 0.12, 0.04, 'sine'), 0);
    setTimeout(() => playTone(659.25, 0.12, 0.04, 'sine'), 90);
    setTimeout(() => playTone(783.99, 0.22, 0.05, 'sine'), 180);
  }

  // ─── SVG Cursors ─────────────────────────────────────────────────────────
  function createPointerSVG(color) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 1.5L13.5 7.5L8.2 9.1L5.8 14.2L2.5 1.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  }

  // ─── Layer Collection ────────────────────────────────────────────────────
  function collectLayers() {
    const seen = new Set();
    const list = [];
    LAYER_QUERY.forEach(item => {
      document.querySelectorAll(item.sel).forEach((el, idx) => {
        if (!seen.has(el)) {
          seen.add(el);
          const hasComplex = el.querySelectorAll('div, svg, img').length > 0;
          const mode = (item.type === 'text' && !hasComplex) ? 'text' : 'box';
          list.push({ el, label: idx > 0 ? `${item.label}_${idx + 1}` : item.label, mode });
        }
      });
    });
    list.sort((a, b) => {
      const ay = a.el.getBoundingClientRect().top + window.scrollY;
      const by = b.el.getBoundingClientRect().top + window.scrollY;
      return ay - by;
    });
    return list;
  }

  // ─── Main Init ───────────────────────────────────────────────────────────
  function initSwarmReplay() {
    const overlay = document.createElement('div');
    overlay.id = 'agent-replay-overlay';
    overlay.style.display = 'none';

    const guideH = document.createElement('div');
    guideH.className = 'agent-guide-h';
    guideH.style.opacity = '0';

    const guideV = document.createElement('div');
    guideV.className = 'agent-guide-v';
    guideV.style.opacity = '0';

    const bbox = document.createElement('div');
    bbox.className = 'agent-bbox';
    bbox.style.opacity = '0';
    bbox.innerHTML = `
      <span class="agent-bbox-handle tl"></span>
      <span class="agent-bbox-handle tr"></span>
      <span class="agent-bbox-handle bl"></span>
      <span class="agent-bbox-handle br"></span>
      <span class="agent-bbox-tag" id="bbox-tag">Layer</span>
      <span class="agent-bbox-dim" id="bbox-dim">0 × 0</span>
    `;
    overlay.appendChild(guideH);
    overlay.appendChild(guideV);
    overlay.appendChild(bbox);

    // ── 18 cursors — each has physics state ──
    const agents = [];
    for (let i = 0; i < MAX_AGENTS; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.cssText = 'opacity:0;position:fixed;pointer-events:none;z-index:9999;';
      cur.innerHTML = `${createPointerSVG(color)}<div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i]}</div>`;
      overlay.appendChild(cur);
      agents.push({
        cur,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        tx: 0, ty: 0,
        active: false,
        layerIdx: -1,
        color
      });
    }

    document.body.appendChild(overlay);

    // ── Dock ──
    const dock = document.createElement('div');
    dock.id = 'agent-replay-dock';
    dock.innerHTML = `
      <div class="flex -space-x-1.5 dock-hide-mobile">
        <span class="w-4 h-4 rounded-full bg-blue-500 border border-[#0d0f17]"></span>
        <span class="w-4 h-4 rounded-full bg-purple-500 border border-[#0d0f17]"></span>
        <span class="w-4 h-4 rounded-full bg-pink-500 border border-[#0d0f17]"></span>
        <span class="w-4 h-4 rounded-full bg-amber-500 border border-[#0d0f17]"></span>
        <span class="w-4 h-4 rounded-full bg-emerald-500 border border-[#0d0f17]"></span>
      </div>
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">18 agents</span>
      <button id="replay-tour-btn" type="button" class="px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors">Touring</button>
      <button id="replay-speed-btn" type="button" class="px-2 py-0.5 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-200 border border-[#2d364d] transition-colors">1x</button>
      <button id="replay-sound-btn" type="button" class="px-2 py-0.5 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-400 border border-[#2d364d] transition-colors">🔇</button>
      <button id="replay-action-btn" type="button" class="px-3 py-1 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors whitespace-nowrap">Replay</button>
      <button id="replay-minimize-btn" type="button" class="text-gray-400 hover:text-white px-1 transition-colors">×</button>
    `;
    document.body.appendChild(dock);

    const miniPill = document.createElement('button');
    miniPill.id = 'agent-replay-mini';
    miniPill.type = 'button';
    miniPill.className = 'fixed bottom-5 left-5 z-[95] hidden items-center gap-1.5 bg-[#12141a]/95 backdrop-blur-md border border-brand-500/50 hover:border-brand-400 text-brand-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-xl transition-all';
    miniPill.innerHTML = '<span>✦</span><span>Swarm Replay</span>';
    document.body.appendChild(miniPill);

    const statusText = document.getElementById('replay-status-text');
    const tourBtn    = document.getElementById('replay-tour-btn');
    const speedBtn   = document.getElementById('replay-speed-btn');
    const soundBtn   = document.getElementById('replay-sound-btn');
    const actionBtn  = document.getElementById('replay-action-btn');
    const minimizeBtn= document.getElementById('replay-minimize-btn');
    const bboxTag    = document.getElementById('bbox-tag');
    const bboxDim    = document.getElementById('bbox-dim');

    // ── Helpers ──
    function clearTimers() {
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.innerHTML = html;
      });
      savedHTMLMap.clear();
    }

    function stopReplay(completed = false, totalCount = 0) {
      isReplaying = false;
      clearTimers();
      restoreAllSavedText();
      document.querySelectorAll('.swarm-blank-layer, .swarm-wireframe-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
        el.classList.add('swarm-built-layer');
      });
      overlay.style.display = 'none';
      bbox.style.opacity = '0';
      guideH.style.opacity = '0';
      guideV.style.opacity = '0';
      agents.forEach(a => { a.cur.style.opacity = '0'; a.active = false; });
      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');
      if (completed) {
        playCompleteSound();
        statusText.textContent = `${totalCount} agents • ${totalCount}/${totalCount} layers`;
      } else {
        statusText.textContent = '18 agents • Live';
      }
      document.documentElement.style.scrollBehavior = '';
    }

    function typeElementText(el, speed) {
      if (!savedHTMLMap.has(el)) savedHTMLMap.set(el, el.innerHTML);
      const fullText = el.textContent.trim();
      if (!fullText) return;
      el.textContent = '';
      el.classList.add('swarm-typing-caret');
      const stepChars = Math.max(1, Math.ceil(fullText.length / 12));
      let pos = 0;
      const typeTick = () => {
        if (!isReplaying) return;
        pos += stepChars;
        if (pos >= fullText.length) {
          el.classList.remove('swarm-typing-caret');
          if (savedHTMLMap.has(el)) { el.innerHTML = savedHTMLMap.get(el); savedHTMLMap.delete(el); }
          return;
        }
        el.textContent = fullText.slice(0, pos);
        playTypeSound();
        replayTimers.push(setTimeout(typeTick, Math.max(16, Math.round(32 / speed))));
      };
      typeTick();
    }

    // ── 60fps cursor physics loop ─────────────────────────────────────────
    // Each agent moves fast when far from target, brakes when close.
    // Idle agents are hidden instantly.
    let lastPhysicsTime = 0;
    function physicsLoop(now) {
      if (!isReplaying) return;
      rafId = requestAnimationFrame(physicsLoop);

      const rawDt = Math.min((now - lastPhysicsTime) / 1000, 0.05);
      lastPhysicsTime = now;
      const dt = rawDt; // speed is baked into target selection timing

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      agents.forEach(a => {
        if (!a.active) {
          // Hidden — fly quickly off-screen and stay hidden
          a.cur.style.opacity = '0';
          return;
        }
        // Clamp target to viewport
        const tx = Math.max(10, Math.min(vw - 90, a.tx));
        const ty = Math.max(10, Math.min(vh - 60, a.ty));

        const dx = tx - a.x;
        const dy = ty - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.5) {
          a.x = tx; a.y = ty;
        } else {
          // Fast when far, brake near target — same feel as the scroll easing
          const pxPerSec = dist > 90
            ? Math.max(1200, dist * 9.0)
            : Math.max(280, dist * 7.0);
          const step = Math.min(dist, pxPerSec * dt);
          a.x += (dx / dist) * step;
          a.y += (dy / dist) * step;
        }

        a.cur.style.transform = `translate3d(${a.x}px,${a.y}px,0)`;
        a.cur.style.opacity   = '1';
      });
    }

    // ── Assign task targets spread across the viewport ────────────────────
    function assignAgentTargets(layerRect, agentCount, layerIdx, totalLayers) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // How many agents are "active" this frame — varies 14-18
      const seed = layerIdx + totalLayers;
      const liveCount = MIN_AGENTS + (seed % (MAX_AGENTS - MIN_AGENTS + 1));
      statusText.textContent = `${liveCount} agents • ${layerIdx + 1}/${totalLayers}`;

      // Zone grid: divide viewport into liveCount cells, each agent gets one zone
      const cols = 4;
      const rows = Math.ceil(liveCount / cols);
      const zoneW = vw / cols;
      const zoneH = vh / rows;

      agents.forEach((a, i) => {
        if (i >= liveCount) {
          // Extra agent over the active cap — hide it
          a.active = false;
          return;
        }

        // The first few agents hover near the active layer rect
        if (i < 3 && layerRect && layerRect.width > 0 && layerRect.height > 0) {
          a.tx = layerRect.left + Math.random() * Math.max(40, layerRect.width);
          a.ty = layerRect.top  + Math.random() * Math.max(20, layerRect.height);
          a.tx = Math.max(10, Math.min(vw - 90, a.tx));
          a.ty = Math.max(10, Math.min(vh - 60, a.ty));
        } else {
          // Spread across zone grid
          const col = i % cols;
          const row = Math.floor(i / cols);
          a.tx = col * zoneW + Math.random() * zoneW * 0.85 + zoneW * 0.075;
          a.ty = row * zoneH + Math.random() * zoneH * 0.85 + zoneH * 0.075;
          a.tx = Math.max(10, Math.min(vw - 90, a.tx));
          a.ty = Math.max(10, Math.min(vh - 60, a.ty));
        }

        // If the agent was hidden, spawn near its target so it doesn't fly in from edge
        if (!a.active) {
          a.x = a.tx + (Math.random() - 0.5) * 100;
          a.y = a.ty + (Math.random() - 0.5) * 60;
        }
        a.active = true;
      });
    }

    // ── Touring scroll ────────────────────────────────────────────────────
    // Smooth eased scroll that keeps the building zone centered in the viewport.
    let scrollTarget  = 0;
    let scrollCurrent = 0;
    let scrollRafId   = null;

    function touringScrollTo(targetY) {
      scrollTarget = Math.max(0, targetY);
      if (scrollRafId) return; // already running
      function step() {
        if (!touringEnabled || !isReplaying) { scrollRafId = null; return; }
        const diff = scrollTarget - scrollCurrent;
        if (Math.abs(diff) < 0.5) {
          scrollCurrent = scrollTarget;
          window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
          scrollRafId = null;
          return;
        }
        // Ease: fast at start, brake at end — mirrors cursor physics
        const dist = Math.abs(diff);
        const pxPerFrame = dist > 120 ? Math.min(diff, Math.sign(diff) * Math.max(60, dist * 0.22))
                                      : Math.sign(diff) * Math.max(3, dist * 0.12);
        scrollCurrent += pxPerFrame;
        window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
        scrollRafId = requestAnimationFrame(step);
      }
      scrollRafId = requestAnimationFrame(step);
    }

    function touringFollow(rect) {
      // Keep the active layer in the upper-mid third (25-55%) of viewport
      const vh = window.innerHeight;
      if (rect.top > vh * 0.55 || rect.bottom < 60) {
        const targetY = window.scrollY + rect.top - vh * 0.30;
        touringScrollTo(targetY);
      }
    }

    // ── 1.6s Intro: blank canvas + cursor ribbon streams ──────────────────
    function runIntro(onDone) {
      overlay.style.display = 'block';
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const introAgentCount = MIN_AGENTS;

      // Two ribbon streams — upper and lower halves
      agents.forEach((a, i) => {
        if (i >= introAgentCount) { a.active = false; return; }
        a.active = true;
        // Stream A: top-left to top-right wave
        // Stream B: bottom-right to bottom-left wave
        const stream = i < introAgentCount / 2 ? 0 : 1;
        const t = (i % Math.ceil(introAgentCount / 2)) / Math.ceil(introAgentCount / 2);
        if (stream === 0) {
          a.x = t * vw * 0.9 + 20;
          a.y = 60 + Math.sin(t * Math.PI) * vh * 0.18;
        } else {
          a.x = vw - 20 - t * vw * 0.9;
          a.y = vh - 80 - Math.sin(t * Math.PI) * vh * 0.18;
        }
        a.tx = a.x; a.ty = a.y;
      });

      // Animate intro ribbons — agents weave
      let introStart = null;
      let introRaf   = null;
      function introFrame(now) {
        if (!isReplaying) { introRaf = null; return; }
        if (!introStart) introStart = now;
        const elapsed = now - introStart;
        const frac = elapsed / INTRO_DUR;

        const vw2 = window.innerWidth;
        const vh2 = window.innerHeight;

        agents.forEach((a, i) => {
          if (!a.active) return;
          const stream = i < Math.ceil(MIN_AGENTS / 2) ? 0 : 1;
          const baseT = (i % Math.ceil(MIN_AGENTS / 2)) / Math.ceil(MIN_AGENTS / 2);
          const t = (baseT + frac * 0.4) % 1; // gentle drift along ribbon
          const wave = Math.sin((t + frac) * Math.PI * 2) * 30;

          if (stream === 0) {
            a.tx = 20 + t * vw2 * 0.9;
            a.ty = 55 + wave + frac * vh2 * 0.08;
          } else {
            a.tx = vw2 - 20 - t * vw2 * 0.9;
            a.ty = vh2 - 80 - wave - frac * vh2 * 0.08;
          }
        });

        if (elapsed >= INTRO_DUR) {
          introRaf = null;
          onDone();
          return;
        }
        introRaf = requestAnimationFrame(introFrame);
      }
      introRaf = requestAnimationFrame(introFrame);
    }

    // ── Main Replay ───────────────────────────────────────────────────────
    function startReplay() {
      if (isReplaying) {
        // If already running, full stop first
        isReplaying = false;
        clearTimers();
        restoreAllSavedText();
      }
      isReplaying = true;

      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollCurrent = 0; scrollTarget = 0;

      const layers = collectLayers();
      const total  = layers.length;

      // Blank canvas
      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer', 'swarm-wireframe-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      statusText.textContent = `${MIN_AGENTS} agents • 0/${total}`;

      // Start 60fps physics loop
      lastPhysicsTime = performance.now();
      rafId = requestAnimationFrame(physicsLoop);

      // Run 1.7s intro, then begin building
      runIntro(() => {
        if (!isReplaying) return;

        let currentDelay = 0;

        layers.forEach((item, idx) => {
          const baseInterval = item.mode === 'text' ? 200 : 135;
          const stepDelay = Math.max(40, Math.round(baseInterval / speedMultiplier));

          // Phase A: wireframe
          replayTimers.push(setTimeout(() => {
            if (!isReplaying) return;
            item.el.classList.remove('swarm-blank-layer');
            item.el.classList.add('swarm-wireframe-layer');
            playWireframeSound();
          }, Math.max(0, currentDelay - Math.round(80 / speedMultiplier))));

          // Phase B: build
          replayTimers.push(setTimeout(() => {
            if (!isReplaying) return;

            const rect = item.el.getBoundingClientRect();

            // Touring scroll
            if (touringEnabled) touringFollow(rect);

            // Update bbox
            if (rect.width > 0 && rect.height > 0) {
              bbox.style.opacity = '1';
              bbox.style.left   = `${rect.left}px`;
              bbox.style.top    = `${rect.top}px`;
              bbox.style.width  = `${rect.width}px`;
              bbox.style.height = `${rect.height}px`;
              bboxTag.textContent = item.label;
              bboxDim.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
              guideH.style.opacity = '1';
              guideH.style.top     = `${rect.top}px`;
              guideV.style.opacity = '1';
              guideV.style.left    = `${rect.left}px`;
            }

            item.el.classList.remove('swarm-wireframe-layer');
            item.el.classList.add('swarm-built-layer');

            if (item.mode === 'text') typeElementText(item.el, speedMultiplier);
            else playSnapSound();

            // Assign cursor targets spread across full viewport
            assignAgentTargets(rect, MAX_AGENTS, idx, total);

            if (idx === total - 1) {
              replayTimers.push(setTimeout(() => stopReplay(true, total), Math.round(500 / speedMultiplier)));
            }
          }, currentDelay));

          currentDelay += stepDelay;
        });
      });
    }

    // ── Button Events ─────────────────────────────────────────────────────
    actionBtn.addEventListener('click', () => {
      ensureAudio();
      if (isReplaying) stopReplay(false);
      else startReplay();
    });

    tourBtn.addEventListener('click', () => {
      touringEnabled = !touringEnabled;
      tourBtn.className = touringEnabled
        ? 'px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors'
        : 'px-2.5 py-0.5 rounded-full bg-[#1a1f2e] text-gray-500 border border-[#2d364d] hover:text-gray-300 transition-colors';
    });

    speedBtn.addEventListener('click', () => {
      speedMultiplier = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 3 : 1;
      speedBtn.textContent = `${speedMultiplier}x`;
      // Live speed change — update ongoing timers by restarting replay if active
      if (isReplaying) startReplay();
    });

    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) ensureAudio();
      soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
      soundBtn.classList.toggle('text-brand-400', soundEnabled);
      soundBtn.classList.toggle('border-brand-500', soundEnabled);
    });

    minimizeBtn.addEventListener('click', () => {
      if (isReplaying) stopReplay(false);
      dock.style.display = 'none';
      miniPill.classList.remove('hidden');
      miniPill.classList.add('flex');
    });

    miniPill.addEventListener('click', () => {
      miniPill.classList.add('hidden');
      miniPill.classList.remove('flex');
      dock.style.display = 'flex';
      startReplay();
    });

    // Auto-start on load
    setTimeout(() => { startReplay(); }, 300);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
