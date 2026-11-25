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
  const INTRO_DUR     = 4700; // ~2.0s glide to 'K' + ~2.7s hold 'K' -> build

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
  let isCompleted     = false;
  let vortexMode      = false;
  let touringEnabled  = true;
  let soundEnabled    = false;
  let speedMultiplier = 1;
  let replayTimers    = [];
  let buildTickTimer  = null;
  let rafId           = null;
  let audioCtx        = null;
  let savedHTMLMap    = new Map();
  let builtCount      = 0;
  let mouseX          = window.innerWidth  * 0.5;
  let mouseY          = window.innerHeight * 0.5;

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
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return; // skip hidden / display:none elements
          seen.add(el);
          // Only type leaf text nodes (no child tags like <span>/<strong>) so parent innerHTML never snapshots half-typed children
          const mode = (item.type === 'text' && el.children.length === 0) ? 'text' : 'box';
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
      cur.innerHTML = `<span class="agent-arrow" style="display:inline-block;width:16px;height:16px;transform-origin:center center;">${createPointerSVG(color)}</span><div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i]}</div>`;
      overlay.appendChild(cur);
      const arrowEl = cur.querySelector('.agent-arrow');
      // 2-lane clockwise schooling streams (inner & outer) like ocean waves
      const lane = i % 2;
      const laneIdx = Math.floor(i / 2);
      const laneTotal = Math.ceil(AGENTS_TOTAL / 2);
      agents.push({
        cur,
        arrowEl,
        x: window.innerWidth  * 0.5,
        y: window.innerHeight * 0.5,
        tx: 0, ty: 0,
        angle: 0,     // smoothed heading rotation (deg)
        trackIdx: -1, // -1 = no track = hidden
        agentSlot: 0, // which slot within the track
        // Clockwise schooling-fish / ocean-wave params around cursor
        vortexR: lane === 0 ? 66 + (i % 3) * 10 : 114 + (i % 3) * 12,
        vortexSpeed: lane === 0 ? 1.85 : 1.45,
        vortexPhase: (laneIdx / laneTotal) * Math.PI * 2 + lane * 0.32,
        color,
      });
    }

    // Track user mouse cursor for schooling-fish vortex
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

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
      if (buildTickTimer) { clearTimeout(buildTickTimer); buildTickTimer = null; }
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (introRafId) { cancelAnimationFrame(introRafId); introRafId = null; }
      if (scrollRafId) { cancelAnimationFrame(scrollRafId); scrollRafId = null; }
    }

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.style.minHeight = '';
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
      isCompleted = false;
      vortexMode  = false;
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

    // Completed state: keep agents visible & swirling like a school of fish around cursor
    function enterCompletedVortex(total) {
      isReplaying = false;
      isCompleted = true;
      vortexMode  = true;
      if (buildTickTimer) { clearTimeout(buildTickTimer); buildTickTimer = null; }
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      restoreAllSavedText();
      document.querySelectorAll('.swarm-blank-layer, .swarm-wireframe-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
        el.classList.add('swarm-built-layer');
      });
      tracks.forEach(hideTrack);
      playCompleteSound();
      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');
      statusText.textContent = `${total} layers • done`;
      document.documentElement.style.scrollBehavior = '';
    }

    function typeElementText(el, speed) {
      if (savedHTMLMap.has(el) || el.children.length > 0) return;
      savedHTMLMap.set(el, el.innerHTML);
      const fullText = el.textContent.trim();
      if (!fullText) return;
      // Reserve current height so typing multi-line text never shifts/shakes layout below
      const h = el.getBoundingClientRect().height;
      if (h > 0) el.style.minHeight = `${h}px`;
      el.textContent = '';
      el.classList.add('swarm-typing-caret');
      const stepChars = Math.max(1, Math.ceil(fullText.length / 12));
      let pos = 0;
      const typeTick = () => {
        if (!isReplaying) return;
        pos += stepChars;
        if (pos >= fullText.length) {
          el.classList.remove('swarm-typing-caret');
          el.style.minHeight = '';
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

    // Rotate only the pointer arrow SVG smoothly toward its flight heading
    function updateArrowHeading(a, vx, vy, dt) {
      if (!a.arrowEl) return;
      if (Math.hypot(vx, vy) < 0.15) return;
      // SVG tip points upper-left (~ -127.4 deg), so +127.4 aligns tip with (vx, vy)
      const targetDeg = (Math.atan2(vy, vx) * 180 / Math.PI) + 127.4;
      const diff = ((targetDeg - a.angle + 540) % 360) - 180;
      a.angle += diff * Math.min(1, dt * 14);
      a.arrowEl.style.transform = `rotate(${a.angle.toFixed(1)}deg)`;
    }

    function physicsLoop(now) {
      if (!isReplaying && !isCompleted) return;
      rafId = requestAnimationFrame(physicsLoop);

      const dt = Math.min((now - lastPhysicsTime) / 1000, 0.05);
      lastPhysicsTime = now;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tSec = now * 0.001;

      agents.forEach((a, i) => {
        if (a.trackIdx < 0) {
          a.cur.style.opacity = '0';
          return;
        }

        let moveX = 0, moveY = 0;

        if (vortexMode) {
          // Clockwise tail-to-nose schooling stream with gentle ocean-wave swell around cursor
          const ang  = a.vortexPhase + tSec * a.vortexSpeed;
          const wave = Math.sin(tSec * 2.1 + ang * 2 - i * 0.35) * 12;
          const r    = a.vortexR + wave;
          const vx   = mouseX + Math.cos(ang) * r;
          const vy   = mouseY + Math.sin(ang) * r * 0.94;

          const dx   = vx - a.x;
          const dy   = vy - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.5) {
            const spd  = Math.max(240, dist * 7.5);
            const step = Math.min(dist, spd * dt);
            moveX = (dx / dist) * step;
            moveY = (dy / dist) * step;
            a.x += moveX;
            a.y += moveY;
          }
          // Aim nose along clockwise tangent when close to orbit, or flight vector when approaching
          const tanX = -Math.sin(ang);
          const tanY =  Math.cos(ang) * 0.94;
          const blend = dist > 45 ? 0.25 : 0.85;
          updateArrowHeading(a, moveX * (1 - blend) + tanX * blend, moveY * (1 - blend) + tanY * blend, dt);
        } else {
          // Building mode: use stable a.tx / a.ty — no getBoundingClientRect() here
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
            moveX = (dx / dist) * step;
            moveY = (dy / dist) * step;
            a.x += moveX;
            a.y += moveY;
            updateArrowHeading(a, moveX, moveY, dt);
          }
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

    // ── Touring scroll (monotonic & silky 60fps exponential ease) ───────────
    let scrollTarget   = 0;
    let scrollCurrent  = 0;
    let scrollRafId    = null;
    let lastScrollTime = 0;

    function touringScrollTo(targetY) {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = Math.max(0, Math.min(maxY, targetY));
      if (scrollRafId) return;
      scrollCurrent  = window.scrollY;
      lastScrollTime = performance.now();
      function step(now) {
        if (!touringEnabled || !isReplaying) { scrollRafId = null; return; }
        const dt = Math.min((now - lastScrollTime) / 1000, 0.05);
        lastScrollTime = now;
        const diff = scrollTarget - scrollCurrent;
        if (Math.abs(diff) < 0.8) {
          scrollCurrent = scrollTarget;
          window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
          scrollRafId = null;
          return;
        }
        // Smooth exponential ease-out — zero sudden speed jumps or jitter
        const px = diff * Math.min(1, dt * 6.5);
        scrollCurrent += px;
        window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
        scrollRafId = requestAnimationFrame(step);
      }
      scrollRafId = requestAnimationFrame(step);
    }

    function touringFollow(rect, el) {
      if (el) {
        const pos = getComputedStyle(el).position;
        if (pos === 'fixed' || pos === 'sticky') return;
      }
      const vh = window.innerHeight;
      if (rect.top > vh * 0.58) {
        const nextY = window.scrollY + rect.top - vh * 0.30;
        // Monotonic forward-only scroll so page never ping-pongs up & down
        if (nextY > scrollTarget + 8) {
          touringScrollTo(nextY);
        }
      }
    }

    // ── 3.2s Intro: scattered 2D → romantic glide into 'K' → hold → build ─
    // ALL 18 agents visible during intro. No circular ring!
    // When 'K' finishes holding, agents immediately fly to build the UI.
    let introRafId = null;

    // 18 balanced geometric points forming a clean capital letter 'K'
    const K_POINTS = [
      // Left vertical stem (7 points, evenly spaced top to bottom)
      [-0.36, -0.50], [-0.36, -0.33], [-0.36, -0.17], [-0.36,  0.00],
      [-0.36,  0.17], [-0.36,  0.33], [-0.36,  0.50],
      // Upper diagonal arm (5 points from stem center to top-right)
      [-0.21, -0.09], [-0.07, -0.19], [ 0.07, -0.29], [ 0.21, -0.39], [ 0.35, -0.50],
      // Lower diagonal leg (6 points kicking cleanly from junction to bottom-right)
      [-0.14,  0.00], [-0.03,  0.10], [ 0.07,  0.20], [ 0.17,  0.30], [ 0.27,  0.40], [ 0.37,  0.50],
    ];

    function runIntro(onDone) {
      overlay.style.display = 'block';
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const kW = Math.min(240, vw * 0.36);
      const kH = Math.min(280, vh * 0.46);

      // Hide text labels during 'K' so only the 18 clean colorful arrowheads form 'K'
      agents.forEach(a => {
        const lbl = a.cur.querySelector('.agent-cursor-label');
        if (lbl) lbl.style.opacity = '0';
      });

      // True 2D scatter across a 6x3 grid (NOT a circle!)
      const cols = 6, rows = 3;
      const slots = Array.from({ length: AGENTS_TOTAL }, (_, idx) => idx);
      // Deterministic shuffle so scatter is organic every time
      slots.sort((a, b) => Math.sin(a * 12.9898) - Math.sin(b * 78.233));

      const ipos = agents.map((a, i) => {
        const cell = slots[i];
        const col  = cell % cols;
        const row  = Math.floor(cell / cols);
        const sx   = Math.max(24, Math.min(vw - 60, ((col + 0.15 + Math.random() * 0.7) / cols) * vw));
        const sy   = Math.max(24, Math.min(vh - 60, ((row + 0.15 + Math.random() * 0.7) / rows) * vh));

        const kp = K_POINTS[i % K_POINTS.length];
        const kx = vw * 0.5 + kp[0] * kW;
        const ky = vh * 0.5 + kp[1] * kH;

        // Sweeping Bezier control point for a soft, romantic floating curve
        const midX = (sx + kx) * 0.5;
        const midY = (sy + ky) * 0.5;
        const dx   = kx - sx;
        const dy   = ky - sy;
        const curveSign = (i % 2 === 0 ? 1 : -1) * (0.28 + (i % 3) * 0.12);
        const cx1 = midX - dy * curveSign;
        const cy1 = midY + dx * curveSign;

        const delayFrac = (i / AGENTS_TOTAL) * 0.12;

        a.cur.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
        a.cur.style.opacity   = '1';
        return { x: sx, y: sy, sx, sy, cx1, cy1, kx, ky, delayFrac };
      });

      let introStart = null;
      let lastIntroNow = performance.now();
      function introFrame(now) {
        if (!isReplaying) { introRafId = null; return; }
        if (!introStart) introStart = now;
        const dt      = Math.min((now - lastIntroNow) / 1000, 0.05);
        lastIntroNow  = now;
        const elapsed = now - introStart;
        const frac    = Math.min(elapsed / INTRO_DUR, 1);

        agents.forEach((a, i) => {
          const ip = ipos[i];
          let nx, ny;

          if (frac < 0.43) {
            // Phase 1 (0 -> ~2.0s): Romantic, unhurried curve from 2D scatter into 'K'
            const localP = Math.max(0, Math.min(1, (frac - ip.delayFrac) / (0.43 - ip.delayFrac)));
            // Smooth easeInOutSine for gentle deceleration into position
            const t = -(Math.cos(Math.PI * localP) - 1) / 2;
            const omt = 1 - t;
            nx = omt * omt * ip.sx + 2 * omt * t * ip.cx1 + t * t * ip.kx;
            ny = omt * omt * ip.sy + 2 * omt * t * ip.cy1 + t * t * ip.ky;
          } else {
            // Phase 2 (~2.0s -> 4.7s, ~2.7s hold): Hold crisp 'K' with gentle floating breath
            const breathe = Math.sin((now * 0.0028) + i * 0.35) * 1.8;
            nx = ip.kx;
            ny = ip.ky + breathe;
          }

          const moveX = nx - ip.x;
          const moveY = ny - ip.y;
          ip.x = nx;
          ip.y = ny;

          if (frac >= 0.43) {
            // Each agent stays on its 'K' spot and looks around independently (up/down/left/right)
            const holdT    = (frac - 0.43) / 0.57;
            const dirSign  = i % 2 === 0 ? 1 : -1;
            const baseLook = ((i * 137.5) % 360) - 180;
            const swing    = Math.sin(holdT * Math.PI * (1.8 + (i % 4) * 0.45) + i) * (75 + (i % 3) * 35);
            const lookDeg  = baseLook + dirSign * swing;
            const diff     = ((lookDeg - a.angle + 540) % 360) - 180;
            a.angle += diff * Math.min(1, dt * 8);
            if (a.arrowEl) a.arrowEl.style.transform = `rotate(${a.angle.toFixed(1)}deg)`;
          } else {
            updateArrowHeading(a, moveX, moveY, dt);
          }

          a.cur.style.transform = `translate3d(${ip.x.toFixed(1)}px,${ip.y.toFixed(1)}px,0)`;
          a.cur.style.opacity   = '1';
        });

        if (elapsed >= INTRO_DUR) {
          introRafId = null;
          // Restore labels & seed physics directly from 'K' positions so they burst straight into building!
          agents.forEach((a, i) => {
            a.x = ipos[i].x; a.y = ipos[i].y;
            const lbl = a.cur.querySelector('.agent-cursor-label');
            if (lbl) lbl.style.opacity = '1';
          });
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
      isCompleted = false;
      vortexMode  = false;
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
      function activateAgents(count, clearOverlays = true) {
        const perTrack = Math.ceil(count / NUM_TRACKS);
        tracks.forEach(tr => {
          tr.agentIndices = [];
          if (clearOverlays) { tr.currentEl = null; hideTrack(tr); }
        });
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

        // ── Reactive round-robin scheduler (supports Touring ON & OFF) ────
        const trackStates = tracks.map(() => ({ queue: [], idx: 0, waiting: false }));
        layers.forEach((item, i) => trackStates[i % NUM_TRACKS].queue.push(item));

        let nextTrackCursor = 0;

        function buildOneItem(tr, t, item, rect) {
          if (touringEnabled && t === 0) touringFollow(rect, item.el);

          item.el.classList.remove('swarm-blank-layer');
          item.el.classList.add('swarm-wireframe-layer');
          playWireframeSound();

          assignToTrack(tr, item, rect);
          updateTrackOverlay(tr, rect, item.label);

          const wireMs = Math.max(25, Math.round(80 / speedMultiplier));
          replayTimers.push(setTimeout(() => {
            if (!isReplaying) return;
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
            if (newLive !== liveCount) { liveCount = newLive; activateAgents(liveCount, false); }
            statusText.textContent = `${liveCount} agents • ${builtCount}/${total}`;

            if (builtCount >= total) {
              replayTimers.push(setTimeout(() => enterCompletedVortex(total),
                Math.round(450 / speedMultiplier)));
            }
          }, wireMs));
        }

        function tickBuilder() {
          buildTickTimer = null;
          if (!isReplaying || isCompleted) return;

          let builtThisTick = false;
          for (let attempt = 0; attempt < NUM_TRACKS; attempt++) {
            const t  = (nextTrackCursor + attempt) % NUM_TRACKS;
            const st = trackStates[t];
            if (st.idx >= st.queue.length) continue;

            const item = st.queue[st.idx];
            const rect = item.el.getBoundingClientRect();
            const canBuild = touringEnabled || (rect.top < window.innerHeight + 60);

            if (canBuild) {
              st.waiting = false;
              st.idx++;
              buildOneItem(tracks[t], t, item, rect);
              nextTrackCursor = (t + 1) % NUM_TRACKS;
              builtThisTick = true;
              break;
            } else {
              st.waiting = true;
            }
          }

          const allQueuedDone = trackStates.every(s => s.idx >= s.queue.length);
          if (allQueuedDone) return; // enterCompletedVortex will trigger when last wireMs finishes

          if (builtThisTick) {
            vortexMode = false;
            const stepMs = Math.max(18, Math.round(70 / speedMultiplier));
            buildTickTimer = setTimeout(tickBuilder, stepMs);
          } else {
            // Manual scroll mode: all visible layers built, waiting for user to scroll down
            if (!vortexMode) {
              vortexMode = true;
              tracks.forEach(hideTrack);
            }
            buildTickTimer = setTimeout(tickBuilder, 120);
          }
        }

        // Immediately kick off the first 2 layers per track so the UI (header + hero)
        // begins appearing right as the 'K' bursts outward, with zero black delay
        for (let round = 0; round < 2; round++) {
          for (let t = 0; t < NUM_TRACKS; t++) {
            const st = trackStates[t];
            if (st.idx < st.queue.length) {
              const item = st.queue[st.idx];
              const rect = item.el.getBoundingClientRect();
              if (touringEnabled || rect.top < window.innerHeight + 60) {
                st.idx++;
                buildOneItem(tracks[t], t, item, rect);
              }
            }
          }
        }

        tickBuilder();
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
      if (touringEnabled && isReplaying && !isCompleted) {
        vortexMode = false;
      }
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
      if (isReplaying || isCompleted) stopReplay(false);
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
