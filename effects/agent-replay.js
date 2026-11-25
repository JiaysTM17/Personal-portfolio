// Swarm Rebuild — 4 Parallel Work Tracks (c1705b1 + surgical fixes)
// Patches:
//  P1: Zero-jitter physics — no getBCR in RAF (use stable a.tx/a.ty)
//  P2: Full-viewport spread — agents target anywhere on screen, not inside element bbox
//  P3: Section-based layer split — tracks work at different Y positions
//  P4: 300-350 layers, dynamic 14-18 agents

(function () {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────
  const NUM_TRACKS    = 4;
  const MIN_AGENTS    = 14;
  const MAX_AGENTS    = 18;
  const AGENTS_TOTAL  = 18;
  const INTRO_DUR     = 1700;

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

  // ─── Layer Definitions ────────────────────────────────────────────────────
  const LAYER_QUERY = [
    { sel: 'header',                                              label: 'HeaderBar',        type: 'box' },
    { sel: 'header a.group',                                      label: 'BrandLogo',        type: 'box' },
    { sel: 'header nav a',                                        label: 'NavLink',          type: 'text' },
    { sel: 'header .hidden.md\\:flex > a',                        label: 'HeaderBtn',        type: 'box' },
    { sel: 'header .hidden.md\\:flex',                            label: 'HeaderActions',    type: 'box' },
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
    { sel: '#hero .grid > *',                                     label: 'HeroGridCell',     type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\]',                          label: 'BentoSection',     type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2',                       label: 'BentoHeading',     type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6',         label: 'BentoCard',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7',         label: 'TechMatrix',       type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5',         label: 'StudioClock',      type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] [class*="col-span"]',      label: 'BentoCell',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] p',                        label: 'BentoPara',        type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] button',                   label: 'BentoBtn',         type: 'box' },
    { sel: '#works',                                              label: 'WorksSection',     type: 'box' },
    { sel: '#works h2',                                           label: 'WorksTitle',       type: 'text' },
    { sel: '#project-filters',                                    label: 'FilterBar',        type: 'box' },
    { sel: '#project-filters button',                             label: 'FilterTab',        type: 'box' },
    { sel: '#projects-grid',                                      label: 'ProjectsGrid',     type: 'box' },
    { sel: '#projects-grid .project-card',                        label: 'ProjectCard',      type: 'box' },
    { sel: '#projects-grid .project-card h3',                     label: 'CardTitle',        type: 'text' },
    { sel: '#projects-grid .project-card p',                      label: 'CardDesc',         type: 'text' },
    { sel: '#projects-grid .project-card a',                      label: 'CardLink',         type: 'box' },
    { sel: '#projects-grid .project-card [class*="tag"]',         label: 'CardTag',          type: 'box' },
    { sel: '#projects-grid .project-card img',                    label: 'CardImg',          type: 'box' },
    { sel: '#projects-grid .project-card footer',                 label: 'CardFooter',       type: 'box' },
    { sel: '#services',                                           label: 'ServicesSection',  type: 'box' },
    { sel: '#services h2',                                        label: 'ServicesTitle',    type: 'text' },
    { sel: '#services .accordion-item',                           label: 'TechAccordion',    type: 'box' },
    { sel: '#services .accordion-item h3',                        label: 'AccordionTitle',   type: 'text' },
    { sel: '#services .accordion-item p',                         label: 'AccordionBody',    type: 'text' },
    { sel: '#services [class*="badge"]',                          label: 'SkillBadge',       type: 'box' },
    { sel: '#services button',                                    label: 'AccordionBtn',     type: 'box' },
    { sel: '#docs',                                               label: 'DocsSection',      type: 'box' },
    { sel: '#docs h2',                                            label: 'DocsTitle',        type: 'text' },
    { sel: '#docs .space-y-4 > div',                              label: 'ArchitectureDoc',  type: 'box' },
    { sel: '#docs .space-y-4 > div h3',                           label: 'DocTitle',         type: 'text' },
    { sel: '#docs .space-y-4 > div p',                            label: 'DocPara',          type: 'text' },
    { sel: '#docs .space-y-4 > div a',                            label: 'DocLink',          type: 'box' },
    { sel: '#about',                                              label: 'AboutSection',     type: 'box' },
    { sel: '#about h2',                                           label: 'AboutTitle',       type: 'text' },
    { sel: '#about .lg\\:col-span-6',                             label: 'AboutColumn',      type: 'box' },
    { sel: '#about .lg\\:col-span-6 > *',                         label: 'AboutChild',       type: 'box' },
    { sel: '#about p',                                            label: 'AboutPara',        type: 'text' },
    { sel: '#about h3',                                           label: 'AboutSubtitle',    type: 'text' },
    { sel: '#about li',                                           label: 'AboutListItem',    type: 'box' },
    { sel: '#journey',                                            label: 'JourneySection',   type: 'box' },
    { sel: '#journey h2',                                         label: 'JourneyTitle',     type: 'text' },
    { sel: '#journey .space-y-6 > div',                           label: 'TimelineItem',     type: 'box' },
    { sel: '#journey .space-y-6 > div h3',                        label: 'TimelineTitle',    type: 'text' },
    { sel: '#journey .space-y-6 > div p',                         label: 'TimelinePara',     type: 'text' },
    { sel: '#journey .space-y-6 > div [class*="badge"]',          label: 'TimelineBadge',    type: 'box' },
    { sel: '#journey .space-y-6 > div a',                         label: 'TimelineLink',     type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\]',                        label: 'ResumeCard',       type: 'box' },
    { sel: '#contact',                                            label: 'ContactSection',   type: 'box' },
    { sel: '#contact h2',                                         label: 'ContactTitle',     type: 'text' },
    { sel: '#contact p',                                          label: 'ContactPara',      type: 'text' },
    { sel: '#contact #copy-email-btn',                            label: 'EmailCopyCard',    type: 'box' },
    { sel: '#contact-form',                                       label: 'ContactForm',      type: 'box' },
    { sel: '#contact-form input',                                 label: 'FormInput',        type: 'box' },
    { sel: '#contact-form textarea',                              label: 'FormTextarea',     type: 'box' },
    { sel: '#contact-form button[type="submit"]',                 label: 'FormSubmit',       type: 'box' },
    { sel: 'footer',                                              label: 'Footer',           type: 'box' },
    { sel: 'footer p',                                            label: 'FooterPara',       type: 'text' },
    { sel: 'footer a',                                            label: 'FooterLink',       type: 'box' },
    { sel: 'main > section > h2',                                 label: 'SectionH2',        type: 'text' },
    { sel: 'main > section > h3',                                 label: 'SectionH3',        type: 'text' },
    { sel: 'main > section > p',                                  label: 'SectionPara',      type: 'text' },
    { sel: '[class*="card"] h3',                                  label: 'CardH3',           type: 'text' },
    { sel: '[class*="card"] p',                                   label: 'CardPara',         type: 'text' },
    { sel: '[class*="badge"]',                                    label: 'BadgeEl',          type: 'box' },
    { sel: '[class*="tag"]',                                      label: 'TagEl',            type: 'box' },
    { sel: '[class*="btn"]:not(#agent-replay-dock *)',             label: 'BtnEl',            type: 'box' },
    { sel: '[class*="grid"] > *',                                 label: 'GridCell',         type: 'box' },
    // ── Extended sweeps → target ~300-350 layers ─────────────────────────
    { sel: '#projects-grid .project-card h4',                     label: 'CardSubtitle',     type: 'text' },
    { sel: '#projects-grid .project-card [class*="badge"]',       label: 'CardBadge',        type: 'box' },
    { sel: '#projects-grid .project-card header',                 label: 'CardHeader',       type: 'box' },
    { sel: '#projects-grid .project-card button',                 label: 'CardBtn',          type: 'box' },
    { sel: '#projects-grid .project-card span',                   label: 'CardSpan',         type: 'text' },
    { sel: '#services h3',                                        label: 'ServicesH3',       type: 'text' },
    { sel: '#services span',                                      label: 'ServicesSpan',     type: 'text' },
    { sel: '#services li',                                        label: 'ServicesLi',       type: 'box' },
    { sel: '#services [class*="tag"]',                            label: 'SkillTag',         type: 'box' },
    { sel: '#services > *',                                       label: 'ServicesRow',      type: 'box' },
    { sel: '#services p',                                         label: 'ServicesPara',     type: 'text' },
    { sel: '#docs [class*="card"]',                               label: 'DocCard',          type: 'box' },
    { sel: '#docs p',                                             label: 'DocsParaGen',      type: 'text' },
    { sel: '#docs span',                                          label: 'DocsSpan',         type: 'text' },
    { sel: '#docs a',                                             label: 'DocsLink',         type: 'box' },
    { sel: '#about h4',                                           label: 'AboutH4',          type: 'text' },
    { sel: '#about [class*="card"]',                              label: 'AboutCard',        type: 'box' },
    { sel: '#about img',                                          label: 'AboutImg',         type: 'box' },
    { sel: '#about a',                                            label: 'AboutLink',        type: 'box' },
    { sel: '#about span',                                         label: 'AboutSpan',        type: 'text' },
    { sel: '#about [class*="badge"]',                             label: 'AboutBadge',       type: 'box' },
    { sel: '#about [class*="tag"]',                               label: 'AboutTag',         type: 'box' },
    { sel: '#journey .space-y-6 > div h4',                        label: 'TimelineH4',       type: 'text' },
    { sel: '#journey .space-y-6 > div [class*="tag"]',            label: 'TimelineTag',      type: 'box' },
    { sel: '#journey .space-y-6 > div span',                      label: 'TimelineSpan',     type: 'text' },
    { sel: '#journey p',                                          label: 'JourneyPara',      type: 'text' },
    { sel: '#journey span',                                       label: 'JourneySpan',      type: 'text' },
    { sel: '#contact h3',                                         label: 'ContactH3',        type: 'text' },
    { sel: '#contact [class*="social"]',                          label: 'SocialLink',       type: 'box' },
    { sel: '#contact span',                                       label: 'ContactSpan',      type: 'text' },
    { sel: '#contact a',                                          label: 'ContactLink',      type: 'box' },
    { sel: 'footer span',                                         label: 'FooterSpan',       type: 'text' },
    { sel: 'main > section > div > h3',                           label: 'SectionDivH3',     type: 'text' },
    { sel: 'main > section > div > p',                            label: 'SectionDivPara',   type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] span',                     label: 'BentoSpan',        type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h3',                       label: 'BentoH3',          type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] li',                       label: 'BentoLi',          type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] a',                        label: 'BentoLink',        type: 'box' },
    { sel: '#hero h1 span',                                       label: 'HeroTitleSpan',    type: 'text' },
    { sel: '#hero [class*="stat"]',                               label: 'StatItem',         type: 'box' },
    { sel: 'header button',                                       label: 'HeaderBtn2',       type: 'box' },
    { sel: '#works > *',                                          label: 'WorksRow',         type: 'box' },
    { sel: '#works p',                                            label: 'WorksPara',        type: 'text' },
  ];

  // ─── Global State ─────────────────────────────────────────────────────────
  let isReplaying     = false;
  let touringEnabled  = true;
  let soundEnabled    = false;
  let speedMultiplier = 1;
  let replayTimers    = [];
  let rafId           = null;
  let audioCtx        = null;
  let savedHTMLMap    = new Map();
  let builtCount      = 0;

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
      const osc  = audioCtx.createOscillator();
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

  function createPointerSVG(color) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 1.5L13.5 7.5L8.2 9.1L5.8 14.2L2.5 1.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  }

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
    document.body.appendChild(overlay);

    // ── Create NUM_TRACKS sets of {bbox, guideH, guideV} ──────────────────
    const tracks = [];
    for (let t = 0; t < NUM_TRACKS; t++) {
      const guideH = document.createElement('div');
      guideH.className = 'agent-guide-h';
      guideH.style.opacity = '0';

      const guideV = document.createElement('div');
      guideV.className = 'agent-guide-v';
      guideV.style.opacity = '0';

      const bbox = document.createElement('div');
      bbox.className = 'agent-bbox';
      bbox.style.opacity = '0';
      const tagId = `bbox-tag-${t}`;
      const dimId = `bbox-dim-${t}`;
      bbox.innerHTML = `
        <span class="agent-bbox-handle tl"></span>
        <span class="agent-bbox-handle tr"></span>
        <span class="agent-bbox-handle bl"></span>
        <span class="agent-bbox-handle br"></span>
        <span class="agent-bbox-tag" id="${tagId}">Layer</span>
        <span class="agent-bbox-dim" id="${dimId}">0 × 0</span>
      `;

      overlay.appendChild(guideH);
      overlay.appendChild(guideV);
      overlay.appendChild(bbox);

      tracks.push({
        guideH, guideV, bbox,
        bboxTag: null, // filled after appendChild
        bboxDim: null,
        currentEl: null,       // element currently being worked on
        offsets: [],           // per-agent stable offsets within currentEl rect
        agentIndices: [],      // which agents belong to this track
      });
    }
    // Now IDs exist in DOM
    tracks.forEach((tr, t) => {
      tr.bboxTag = document.getElementById(`bbox-tag-${t}`);
      tr.bboxDim = document.getElementById(`bbox-dim-${t}`);
    });

    // ── 18 agent cursors ──────────────────────────────────────────────────
    const agents = [];
    for (let i = 0; i < AGENTS_TOTAL; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur   = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.cssText = 'opacity:0;position:fixed;pointer-events:none;z-index:9999;';
      cur.innerHTML = `${createPointerSVG(color)}<div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i]}</div>`;
      overlay.appendChild(cur);
      agents.push({
        cur,
        x: window.innerWidth  * 0.5,
        y: window.innerHeight * 0.5,
        tx: 0, ty: 0,
        trackIdx: -1, // -1 = no track = hidden
        agentSlot: 0, // which slot within the track (0,1,2)
        color,
      });
    }

    // ── Dock ──────────────────────────────────────────────────────────────
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
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">12 agents</span>
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

    const statusText  = document.getElementById('replay-status-text');
    const tourBtn     = document.getElementById('replay-tour-btn');
    const speedBtn    = document.getElementById('replay-speed-btn');
    const soundBtn    = document.getElementById('replay-sound-btn');
    const actionBtn   = document.getElementById('replay-action-btn');
    const minimizeBtn = document.getElementById('replay-minimize-btn');

    // ── Helpers ────────────────────────────────────────────────────────────
    function clearTimers() {
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (introRafId) { cancelAnimationFrame(introRafId); introRafId = null; }
    }

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.innerHTML = html;
      });
      savedHTMLMap.clear();
    }

    function hideTrack(tr) {
      tr.bbox.style.opacity   = '0';
      tr.guideH.style.opacity = '0';
      tr.guideV.style.opacity = '0';
      tr.currentEl = null;
    }

    function stopReplay(completed = false, total = 0) {
      isReplaying = false;
      clearTimers();
      restoreAllSavedText();
      document.querySelectorAll('.swarm-blank-layer, .swarm-wireframe-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
        el.classList.add('swarm-built-layer');
      });
      overlay.style.display = 'none';
      tracks.forEach(hideTrack);
      agents.forEach(a => { a.cur.style.opacity = '0'; a.trackIdx = -1; });
      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');
      statusText.textContent = completed
        ? `${total} layers • done`
        : `${MIN_AGENTS} agents • Live`;
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

    // ── 60fps physics loop — ZERO getBoundingClientRect() ─────────────────
    // Agents use stable a.tx / a.ty computed ONCE at build time (assignToTrack).
    // On arrival → pick new random target spread across FULL viewport.
    let lastPhysicsTime = 0;

    // Pick a new target anywhere on viewport (makes agents roam freely)
    function pickNextTarget(a) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      a.tx = 20 + Math.random() * (vw - 110);
      a.ty = 20 + Math.random() * (vh - 70);
    }

    function physicsLoop(now) {
      if (!isReplaying) return;
      rafId = requestAnimationFrame(physicsLoop);

      const dt = Math.min((now - lastPhysicsTime) / 1000, 0.05);
      lastPhysicsTime = now;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      agents.forEach(a => {
        if (a.trackIdx < 0) {
          a.cur.style.opacity = '0';
          return;
        }

        // Use stable a.tx / a.ty — no getBoundingClientRect() here
        const dx   = a.tx - a.x;
        const dy   = a.ty - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 6) {
          // Arrived — wander to next random spot across full viewport
          a.x = a.tx; a.y = a.ty;
          pickNextTarget(a);
        } else {
          // Fast far away, ease-out in final 80px → smooth arrival, no jitter
          const spd = dist > 80
            ? Math.max(1000, dist * 8)
            : Math.max(220, dist * 5.5);
          const step = Math.min(dist, spd * dt);
          a.x += (dx / dist) * step;
          a.y += (dy / dist) * step;
        }

        a.x = Math.max(10, Math.min(vw - 90, a.x));
        a.y = Math.max(10, Math.min(vh - 60, a.y));

        a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
        a.cur.style.opacity   = '1';
      });
    }

    // ── Update a track's bbox to a new element ────────────────────────────
    function updateTrackOverlay(tr, rect, label) {
      if (rect.width <= 0 || rect.height <= 0) return;
      tr.bbox.style.opacity = '1';
      tr.bbox.style.left    = `${rect.left}px`;
      tr.bbox.style.top     = `${rect.top}px`;
      tr.bbox.style.width   = `${rect.width}px`;
      tr.bbox.style.height  = `${rect.height}px`;
      tr.bboxTag.textContent = label;
      tr.bboxDim.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    }

    // ── Assign an element to a track — set stable a.tx/a.ty for each agent ─
    // Agents get targets spread across the FULL viewport so they look scattered.
    // Target = element center biased toward agent's natural screen column.
    function assignToTrack(tr, item, rect) {
      tr.currentEl = item.el;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ex = rect.left + rect.width  / 2;
      const ey = rect.top  + rect.height / 2;

      tr.agentIndices.forEach((aIdx) => {
        const a = agents[aIdx];
        // Spread all 14-18 agents across a 4x5 viewport grid so they never clump in one corner
        const col = aIdx % 4;
        const row = Math.floor(aIdx / 4) % 5;
        const zoneX = ((col + 0.5) / 4) * vw;
        const zoneY = ((row + 0.5) / 5) * vh;
        // Blend 35% element position + 65% full-viewport spread + jitter
        const tx = ex * 0.35 + zoneX * 0.65 + (Math.random() - 0.5) * vw * 0.22;
        const ty = ey * 0.35 + zoneY * 0.65 + (Math.random() - 0.5) * vh * 0.20;
        a.tx = Math.max(20, Math.min(vw - 100, tx));
        a.ty = Math.max(20, Math.min(vh - 70,  ty));
      });

      // Per-track offsets kept for compat (unused by new physicsLoop)
      tr.offsets = tr.agentIndices.map(() => ({ ox: 0.5, oy: 0.5 }));
    }

    // ── Touring scroll ─────────────────────────────────────────────────────
    let scrollTarget  = 0;
    let scrollCurrent = 0;
    let scrollRafId   = null;

    function touringScrollTo(targetY) {
      scrollTarget = Math.max(0, targetY);
      if (scrollRafId) return;
      function step() {
        if (!touringEnabled || !isReplaying) { scrollRafId = null; return; }
        const diff = scrollTarget - scrollCurrent;
        if (Math.abs(diff) < 0.5) {
          scrollCurrent = scrollTarget;
          window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
          scrollRafId = null;
          return;
        }
        const d  = Math.abs(diff);
        const px = d > 120
          ? Math.sign(diff) * Math.max(60, d * 0.22)
          : Math.sign(diff) * Math.max(3,  d * 0.12);
        scrollCurrent += px;
        window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
        scrollRafId = requestAnimationFrame(step);
      }
      scrollRafId = requestAnimationFrame(step);
    }

    function touringFollow(rect) {
      const vh = window.innerHeight;
      if (rect.top > vh * 0.60 || rect.bottom < 60) {
        touringScrollTo(window.scrollY + rect.top - vh * 0.30);
      }
    }

    // ── 1.7s Intro: ribbon streams ─────────────────────────────────────────
    // ALL agents visible during intro. Intro uses its OWN RAF — does NOT
    // modify a.trackIdx so it never conflicts with physicsLoop.
    // physicsLoop is NOT started until after intro completes.
    let introRafId = null;

    function runIntro(onDone) {
      overlay.style.display = 'block';
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Intro positions stored separately — don't touch a.x/a.y (physics uses those)
      const ipos = agents.map((a, i) => {
        const stream = i < AGENTS_TOTAL / 2 ? 0 : 1;
        const t = (i % Math.ceil(AGENTS_TOTAL / 2)) / Math.ceil(AGENTS_TOTAL / 2);
        let x, y;
        if (stream === 0) {
          x = t * vw * 0.9 + 20;
          y = 60 + Math.sin(t * Math.PI) * vh * 0.18;
        } else {
          x = vw - 20 - t * vw * 0.9;
          y = vh - 80 - Math.sin(t * Math.PI) * vh * 0.18;
        }
        // Show all agents in intro
        a.cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        a.cur.style.opacity   = '1';
        return { x, y };
      });

      let introStart = null;
      function introFrame(now) {
        if (!isReplaying) { introRafId = null; return; }
        if (!introStart) introStart = now;
        const elapsed = now - introStart;
        const frac    = Math.min(elapsed / INTRO_DUR, 1);
        const vw2 = window.innerWidth;
        const vh2 = window.innerHeight;

        agents.forEach((a, i) => {
          const stream = i < Math.ceil(AGENTS_TOTAL / 2) ? 0 : 1;
          const baseT  = (i % Math.ceil(AGENTS_TOTAL / 2)) / Math.ceil(AGENTS_TOTAL / 2);
          const t      = (baseT + frac * 0.5) % 1;
          const wave   = Math.sin((t + frac) * Math.PI * 2) * 35;

          let nx, ny;
          if (stream === 0) {
            nx = 20 + t * vw2 * 0.9;
            ny = 55 + wave + frac * vh2 * 0.09;
          } else {
            nx = vw2 - 20 - t * vw2 * 0.9;
            ny = vh2 - 80 - wave - frac * vh2 * 0.09;
          }

          // Smooth move toward ribbon target
          const dx = nx - ipos[i].x;
          const dy = ny - ipos[i].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d > 1) {
            const spd = Math.min(d, Math.max(380, d * 5) / 60);
            ipos[i].x += (dx / d) * spd;
            ipos[i].y += (dy / d) * spd;
          } else {
            ipos[i].x = nx; ipos[i].y = ny;
          }
          a.cur.style.transform = `translate3d(${ipos[i].x.toFixed(1)}px,${ipos[i].y.toFixed(1)}px,0)`;
          a.cur.style.opacity   = '1';
        });

        if (elapsed >= INTRO_DUR) {
          introRafId = null;
          // Seed a.x/a.y from final intro positions so physics starts smoothly
          agents.forEach((a, i) => { a.x = ipos[i].x; a.y = ipos[i].y; });
          onDone();
          return;
        }
        introRafId = requestAnimationFrame(introFrame);
      }
      introRafId = requestAnimationFrame(introFrame);
    }

    // ── Main Replay ────────────────────────────────────────────────────────
    function startReplay() {
      if (isReplaying) {
        isReplaying = false;
        clearTimers();
        restoreAllSavedText();
      }
      // Cancel any in-progress intro RAF
      if (introRafId) { cancelAnimationFrame(introRafId); introRafId = null; }

      isReplaying = true;
      builtCount  = 0;

      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollCurrent = 0; scrollTarget = 0;

      const layers = collectLayers();
      const total  = layers.length;

      // Blank canvas during 1.7s intro
      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer', 'swarm-wireframe-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      statusText.textContent = `${MIN_AGENTS} agents • 0/${total}`;

      // ── Dynamic agent activation (14-18, varies every 35 layers) ─────────
      let liveCount = MIN_AGENTS;

      function getLiveCount() {
        return MIN_AGENTS + (Math.floor(builtCount / 35) % (MAX_AGENTS - MIN_AGENTS + 1));
      }

      // Distribute `count` agents across NUM_TRACKS (balanced)
      function activateAgents(count) {
        const perTrack = Math.ceil(count / NUM_TRACKS);
        tracks.forEach(tr => { tr.agentIndices = []; tr.currentEl = null; hideTrack(tr); });
        let assigned = 0;
        for (let t = 0; t < NUM_TRACKS && assigned < count; t++) {
          for (let s = 0; s < perTrack && assigned < count; s++) {
            const aIdx = t * perTrack + s;
            if (aIdx < AGENTS_TOTAL) {
              agents[aIdx].trackIdx  = t;
              agents[aIdx].agentSlot = s;
              tracks[t].agentIndices.push(aIdx);
              assigned++;
            }
          }
        }
        // Hide unused agents
        for (let i = count; i < AGENTS_TOTAL; i++) {
          agents[i].trackIdx = -1;
          agents[i].cur.style.opacity = '0';
        }
        // Seed free-roam start targets for active agents that have none
        const vw = window.innerWidth; const vh = window.innerHeight;
        for (let i = 0; i < count; i++) {
          if (agents[i].tx === 0 && agents[i].ty === 0) {
            agents[i].tx = 20 + Math.random() * (vw - 110);
            agents[i].ty = 20 + Math.random() * (vh - 70);
          }
        }
      }

      activateAgents(liveCount);

      // ── physicsLoop starts AFTER intro to avoid racing with introFrame ──
      // Run 1.7s intro ribbons first
      runIntro(() => {
        if (!isReplaying) return;

        // Ensure extra agents hidden after intro
        for (let i = liveCount; i < AGENTS_TOTAL; i++) {
          agents[i].cur.style.opacity = '0';
        }

        // Start physics loop
        lastPhysicsTime = performance.now();
        rafId = requestAnimationFrame(physicsLoop);

        // ── Round-robin layer split across NUM_TRACKS ────────────────────
        // All 4 tracks build the current viewport top-to-bottom simultaneously
        // so parent <section>s appear right away and Touring stays in sync.
        const trackLayers = tracks.map(() => []);
        layers.forEach((item, i) => trackLayers[i % NUM_TRACKS].push(item));

        const baseInterval = 280;

        tracks.forEach((tr, t) => {
          if (trackLayers[t].length === 0) return;
          const startOffset = t * Math.round(50 / speedMultiplier);
          let delay = startOffset;

          trackLayers[t].forEach(item => {
            const stepDelay = Math.max(60, Math.round(baseInterval / speedMultiplier));

            // Phase A: wireframe flash
            replayTimers.push(setTimeout(() => {
              if (!isReplaying) return;
              item.el.classList.remove('swarm-blank-layer');
              item.el.classList.add('swarm-wireframe-layer');
              playWireframeSound();
            }, Math.max(0, delay - Math.round(90 / speedMultiplier))));

            // Phase B: build
            replayTimers.push(setTimeout(() => {
              if (!isReplaying) return;

              const rect = item.el.getBoundingClientRect();

              // Touring — driven by track 0 (frontrunner)
              if (touringEnabled && t === 0) touringFollow(rect);

              assignToTrack(tr, item, rect);
              updateTrackOverlay(tr, rect, item.label);

              // Ensure no ancestor container stays blank and hides this built element
              let p = item.el.parentElement;
              while (p && p !== document.body) {
                if (p.classList.contains('swarm-blank-layer')) {
                  p.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
                  p.classList.add('swarm-built-layer');
                }
                p = p.parentElement;
              }

              item.el.classList.remove('swarm-wireframe-layer');
              item.el.classList.add('swarm-built-layer');

              if (item.mode === 'text') typeElementText(item.el, speedMultiplier);
              else playSnapSound();

              builtCount++;

              // Dynamic 14-18: recalculate every 35 layers
              const newLive = getLiveCount();
              if (newLive !== liveCount) { liveCount = newLive; activateAgents(liveCount); }
              statusText.textContent = `${liveCount} agents • ${builtCount}/${total}`;

              if (builtCount >= total) {
                replayTimers.push(setTimeout(() => stopReplay(true, total),
                  Math.round(600 / speedMultiplier)));
              }
            }, delay));

            delay += stepDelay;
          });
        });
      });
    }

    // ── Button Events ──────────────────────────────────────────────────────
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

    // Auto-start
    setTimeout(() => { startReplay(); }, 300);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
