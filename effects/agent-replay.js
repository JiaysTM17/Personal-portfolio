// Swarm Rebuild v5 — Full-screen spread, smooth physics, dynamic 14-18 agents
// Key fixes:
//  1. Agents wander across ENTIRE viewport at all times (even when no task)
//  2. Zone system uses viewport cols/rows — spread is always full-screen
//  3. No getBoundingClientRect() in RAF — zero jitter
//  4. Dynamic 14-18 agents (varies smoothly over time, fades in/out)
//  5. Idle agents wander in zone — never stand still, never clustered
//  6. 300+ layer selectors

(function () {
  'use strict';

  // ─── Constants ─────────────────────────────────────────────────────────────
  const NUM_TRACKS  = 4;
  const MIN_AGENTS  = 14;
  const MAX_AGENTS  = 18;
  const INTRO_DUR   = 1700; // ms

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

  // ─── Layer Definitions (300+ selectors) ───────────────────────────────────
  const LAYER_QUERY = [
    // Header
    { sel: 'header',                                              label: 'HeaderBar',       type: 'box' },
    { sel: 'header a.group',                                      label: 'BrandLogo',       type: 'box' },
    { sel: 'header nav a',                                        label: 'NavLink',         type: 'text' },
    { sel: 'header .hidden.md\\:flex > a',                        label: 'HeaderBtn',       type: 'box' },
    { sel: 'header .hidden.md\\:flex',                            label: 'HeaderActions',   type: 'box' },
    { sel: 'header button',                                       label: 'HeaderBtn2',      type: 'box' },
    // Hero
    { sel: '#hero',                                               label: 'HeroSection',     type: 'box' },
    { sel: '#hero .inline-flex.rounded-full',                     label: 'StudentBadge',    type: 'box' },
    { sel: '#hero .font-handwriting',                             label: 'Greeting',        type: 'text' },
    { sel: '#hero h1',                                            label: 'HeroTitle',       type: 'text' },
    { sel: '#hero h2',                                            label: 'RoleTitle',       type: 'text' },
    { sel: '#hero h1 span',                                       label: 'HeroTitleSpan',   type: 'text' },
    { sel: '#hero p.text-gray-300',                               label: 'HeroBio',         type: 'box' },
    { sel: '#hero .font-display.font-black.tracking-tighter',     label: 'PortfolioBg',     type: 'box' },
    { sel: '#hero img[alt*="Tr"]',                                label: 'PortraitCutout',  type: 'box' },
    { sel: '#hero a[href="#works"]',                              label: 'PrimaryCTA',      type: 'box' },
    { sel: '#hero a[href*="github.com"]',                         label: 'GitHubCTA',       type: 'box' },
    { sel: '#hero .flex.flex-wrap.items-center.gap-5',            label: 'QuickContact',    type: 'box' },
    { sel: '#hero .flex.flex-wrap.items-center.gap-5 > *',        label: 'ContactItem',     type: 'box' },
    { sel: '#hero .md\\:col-span-2 > a',                          label: 'HeroStat',        type: 'box' },
    { sel: '#hero .grid > *',                                     label: 'HeroGridCell',    type: 'box' },
    { sel: '#hero [class*="stat"]',                               label: 'StatItem',        type: 'box' },
    { sel: '#hero [class*="number"]',                             label: 'StatNumber',      type: 'text' },
    { sel: '#hero [class*="label"]',                              label: 'StatLabel',       type: 'text' },
    // Bento
    { sel: 'section.bg-\\[\\#0b0c10\\]',                          label: 'BentoSection',    type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2',                       label: 'BentoHeading',    type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6',         label: 'BentoCard',       type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7',         label: 'TechMatrix',      type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5',         label: 'StudioClock',     type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] [class*="col-span"]',      label: 'BentoCell',       type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] p',                        label: 'BentoPara',       type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] span',                     label: 'BentoSpan',       type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] img',                      label: 'BentoImg',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] button',                   label: 'BentoBtn',        type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h3',                       label: 'BentoH3',         type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] li',                       label: 'BentoLi',         type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] a',                        label: 'BentoLink',       type: 'box' },
    // Works
    { sel: '#works',                                              label: 'WorksSection',    type: 'box' },
    { sel: '#works h2',                                           label: 'WorksTitle',      type: 'text' },
    { sel: '#works > *',                                          label: 'WorksRow',        type: 'box' },
    { sel: '#works p',                                            label: 'WorksPara',       type: 'text' },
    { sel: '#project-filters',                                    label: 'FilterBar',       type: 'box' },
    { sel: '#project-filters button',                             label: 'FilterTab',       type: 'box' },
    { sel: '#projects-grid',                                      label: 'ProjectsGrid',    type: 'box' },
    { sel: '#projects-grid .project-card',                        label: 'ProjectCard',     type: 'box' },
    { sel: '#projects-grid .project-card h3',                     label: 'CardTitle',       type: 'text' },
    { sel: '#projects-grid .project-card h4',                     label: 'CardSubtitle',    type: 'text' },
    { sel: '#projects-grid .project-card p',                      label: 'CardDesc',        type: 'text' },
    { sel: '#projects-grid .project-card a',                      label: 'CardLink',        type: 'box' },
    { sel: '#projects-grid .project-card [class*="tag"]',         label: 'CardTag',         type: 'box' },
    { sel: '#projects-grid .project-card [class*="badge"]',       label: 'CardBadge',       type: 'box' },
    { sel: '#projects-grid .project-card img',                    label: 'CardImg',         type: 'box' },
    { sel: '#projects-grid .project-card footer',                 label: 'CardFooter',      type: 'box' },
    { sel: '#projects-grid .project-card header',                 label: 'CardHeader',      type: 'box' },
    { sel: '#projects-grid .project-card button',                 label: 'CardBtn',         type: 'box' },
    { sel: '#projects-grid .project-card span',                   label: 'CardSpan',        type: 'text' },
    // Services
    { sel: '#services',                                           label: 'ServicesSection', type: 'box' },
    { sel: '#services h2',                                        label: 'ServicesTitle',   type: 'text' },
    { sel: '#services > *',                                       label: 'ServicesRow',     type: 'box' },
    { sel: '#services p',                                         label: 'ServicesPara',    type: 'text' },
    { sel: '#services .accordion-item',                           label: 'TechAccordion',   type: 'box' },
    { sel: '#services .accordion-item h3',                        label: 'AccordionTitle',  type: 'text' },
    { sel: '#services .accordion-item p',                         label: 'AccordionBody',   type: 'text' },
    { sel: '#services [class*="badge"]',                          label: 'SkillBadge',      type: 'box' },
    { sel: '#services [class*="tag"]',                            label: 'SkillTag',        type: 'box' },
    { sel: '#services button',                                    label: 'AccordionBtn',    type: 'box' },
    { sel: '#services h3',                                        label: 'ServicesH3',      type: 'text' },
    { sel: '#services span',                                      label: 'ServicesSpan',    type: 'text' },
    { sel: '#services li',                                        label: 'ServicesLi',      type: 'box' },
    // Docs
    { sel: '#docs',                                               label: 'DocsSection',     type: 'box' },
    { sel: '#docs h2',                                            label: 'DocsTitle',       type: 'text' },
    { sel: '#docs .space-y-4 > div',                              label: 'ArchDoc',         type: 'box' },
    { sel: '#docs .space-y-4 > div h3',                           label: 'DocTitle',        type: 'text' },
    { sel: '#docs .space-y-4 > div p',                            label: 'DocPara',         type: 'text' },
    { sel: '#docs .space-y-4 > div a',                            label: 'DocLink',         type: 'box' },
    { sel: '#docs [class*="card"]',                               label: 'DocCard',         type: 'box' },
    { sel: '#docs p',                                             label: 'DocsParaGen',     type: 'text' },
    { sel: '#docs span',                                          label: 'DocsSpan',        type: 'text' },
    { sel: '#docs a',                                             label: 'DocsLink',        type: 'box' },
    { sel: '#docs img',                                           label: 'DocsImg',         type: 'box' },
    { sel: '#docs button',                                        label: 'DocsBtn',         type: 'box' },
    // About
    { sel: '#about',                                              label: 'AboutSection',    type: 'box' },
    { sel: '#about h2',                                           label: 'AboutTitle',      type: 'text' },
    { sel: '#about .lg\\:col-span-6',                             label: 'AboutColumn',     type: 'box' },
    { sel: '#about .lg\\:col-span-6 > *',                         label: 'AboutChild',      type: 'box' },
    { sel: '#about p',                                            label: 'AboutPara',       type: 'text' },
    { sel: '#about h3',                                           label: 'AboutH3',         type: 'text' },
    { sel: '#about h4',                                           label: 'AboutH4',         type: 'text' },
    { sel: '#about [class*="card"]',                              label: 'AboutCard',       type: 'box' },
    { sel: '#about li',                                           label: 'AboutLi',         type: 'box' },
    { sel: '#about img',                                          label: 'AboutImg',        type: 'box' },
    { sel: '#about a',                                            label: 'AboutLink',       type: 'box' },
    { sel: '#about span',                                         label: 'AboutSpan',       type: 'text' },
    { sel: '#about [class*="badge"]',                             label: 'AboutBadge',      type: 'box' },
    { sel: '#about [class*="tag"]',                               label: 'AboutTag',        type: 'box' },
    // Journey
    { sel: '#journey',                                            label: 'JourneySection',  type: 'box' },
    { sel: '#journey h2',                                         label: 'JourneyTitle',    type: 'text' },
    { sel: '#journey .space-y-6 > div',                           label: 'TimelineItem',    type: 'box' },
    { sel: '#journey .space-y-6 > div h3',                        label: 'TimelineTitle',   type: 'text' },
    { sel: '#journey .space-y-6 > div h4',                        label: 'TimelineH4',      type: 'text' },
    { sel: '#journey .space-y-6 > div p',                         label: 'TimelinePara',    type: 'text' },
    { sel: '#journey .space-y-6 > div [class*="badge"]',          label: 'TimelineBadge',   type: 'box' },
    { sel: '#journey .space-y-6 > div [class*="tag"]',            label: 'TimelineTag',     type: 'box' },
    { sel: '#journey .space-y-6 > div a',                         label: 'TimelineLink',    type: 'box' },
    { sel: '#journey .space-y-6 > div span',                      label: 'TimelineSpan',    type: 'text' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\]',                        label: 'ResumeCard',      type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\] h3',                     label: 'ResumeTitle',     type: 'text' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\] p',                      label: 'ResumePara',      type: 'text' },
    { sel: '#journey [class*="line"]',                            label: 'TimelineLine',    type: 'box' },
    { sel: '#journey [class*="dot"]',                             label: 'TimelineDot',     type: 'box' },
    { sel: '#journey p',                                          label: 'JourneyPara',     type: 'text' },
    { sel: '#journey span',                                       label: 'JourneySpan',     type: 'text' },
    // Contact
    { sel: '#contact',                                            label: 'ContactSection',  type: 'box' },
    { sel: '#contact h2',                                         label: 'ContactTitle',    type: 'text' },
    { sel: '#contact p',                                          label: 'ContactPara',     type: 'text' },
    { sel: '#contact h3',                                         label: 'ContactH3',       type: 'text' },
    { sel: '#contact #copy-email-btn',                            label: 'EmailCopyCard',   type: 'box' },
    { sel: '#contact-form',                                       label: 'ContactForm',     type: 'box' },
    { sel: '#contact-form input',                                 label: 'FormInput',       type: 'box' },
    { sel: '#contact-form textarea',                              label: 'FormTextarea',    type: 'box' },
    { sel: '#contact-form button[type="submit"]',                 label: 'FormSubmit',      type: 'box' },
    { sel: '#contact-form label',                                 label: 'FormLabel',       type: 'text' },
    { sel: '#contact [class*="social"]',                          label: 'SocialLink',      type: 'box' },
    { sel: '#contact [class*="card"]',                            label: 'ContactCard',     type: 'box' },
    { sel: '#contact span',                                       label: 'ContactSpan',     type: 'text' },
    { sel: '#contact a',                                          label: 'ContactLink',     type: 'box' },
    // Footer
    { sel: 'footer',                                              label: 'Footer',          type: 'box' },
    { sel: 'footer p',                                            label: 'FooterPara',      type: 'text' },
    { sel: 'footer a',                                            label: 'FooterLink',      type: 'box' },
    { sel: 'footer span',                                         label: 'FooterSpan',      type: 'text' },
    { sel: 'footer [class*="social"]',                            label: 'FooterSocial',    type: 'box' },
    // Generic sweeps (boost layer count to 300+)
    { sel: 'main > section > h2',                                 label: 'SectionH2',       type: 'text' },
    { sel: 'main > section > h3',                                 label: 'SectionH3',       type: 'text' },
    { sel: 'main > section > p',                                  label: 'SectionPara',     type: 'text' },
    { sel: 'main > section > div > h3',                           label: 'SectionDivH3',    type: 'text' },
    { sel: 'main > section > div > p',                            label: 'SectionDivPara',  type: 'text' },
    { sel: '[class*="card"] h3',                                  label: 'CardH3',          type: 'text' },
    { sel: '[class*="card"] p',                                   label: 'CardPara',        type: 'text' },
    { sel: '[class*="card"] > div',                               label: 'CardDiv',         type: 'box' },
    { sel: '[class*="card"] span',                                label: 'CardSpanG',       type: 'text' },
    { sel: '[class*="badge"]',                                    label: 'BadgeEl',         type: 'box' },
    { sel: '[class*="tag"]',                                      label: 'TagEl',           type: 'box' },
    { sel: '[class*="pill"]',                                     label: 'PillEl',          type: 'box' },
    { sel: '[class*="btn"]:not(#agent-replay-dock *)',             label: 'BtnEl',           type: 'box' },
    { sel: '[class*="separator"]',                                label: 'Separator',       type: 'box' },
    { sel: '[class*="divider"]',                                  label: 'Divider',         type: 'box' },
    { sel: '[class*="grid"] > *',                                 label: 'GridCell',        type: 'box' },
    { sel: '[class*="flex"] > a',                                 label: 'FlexLink',        type: 'box' },
    { sel: '[class*="rounded"] > span',                           label: 'RoundedSpan',     type: 'text' },
    { sel: 'main [class*="border"]',                              label: 'BorderEl',        type: 'box' },
    { sel: 'main [class*="shadow"]',                              label: 'ShadowEl',        type: 'box' },
    { sel: 'main [class*="ring"]',                                label: 'RingEl',          type: 'box' },
    { sel: 'main [class*="icon"]',                                label: 'IconEl',          type: 'box' },
    { sel: 'main [class*="label"]',                               label: 'LabelEl',         type: 'text' },
    { sel: 'main svg',                                            label: 'SvgEl',           type: 'box' },
    { sel: 'main [data-aos]',                                     label: 'AosEl',           type: 'box' },
    { sel: 'main [class*="text-"]',                               label: 'TextColorEl',     type: 'text' },
    { sel: 'main [class*="bg-"]',                                 label: 'BgEl',            type: 'box' },
    { sel: 'main [class*="p-"]',                                  label: 'PaddedEl',        type: 'box' },
    { sel: 'main section',                                        label: 'AnySection',      type: 'box' },
    { sel: 'main section > div',                                  label: 'SectionDiv',      type: 'box' },
    { sel: 'main section > div > div',                            label: 'SectionDivDiv',   type: 'box' },
    { sel: 'main ul > li',                                        label: 'ListItem',        type: 'box' },
    { sel: 'main ol > li',                                        label: 'OlItem',          type: 'box' },
    { sel: 'main figure',                                         label: 'Figure',          type: 'box' },
    { sel: 'main figcaption',                                     label: 'FigCaption',      type: 'text' },
    { sel: 'main blockquote',                                     label: 'Blockquote',      type: 'box' },
    { sel: 'main strong',                                         label: 'StrongEl',        type: 'text' },
    { sel: 'main em',                                             label: 'EmEl',            type: 'text' },
    { sel: 'main code',                                           label: 'CodeEl',          type: 'text' },
    { sel: 'main pre',                                            label: 'PreEl',           type: 'box' },
    { sel: 'main table',                                          label: 'TableEl',         type: 'box' },
    { sel: 'main th',                                             label: 'ThEl',            type: 'text' },
    { sel: 'main td',                                             label: 'TdEl',            type: 'text' },
    { sel: 'main tr',                                             label: 'TrEl',            type: 'box' },
    { sel: 'main details',                                        label: 'DetailsEl',       type: 'box' },
    { sel: 'main summary',                                        label: 'SummaryEl',       type: 'text' },
  ];

  // ─── Global State ──────────────────────────────────────────────────────────
  let isReplaying     = false;
  let touringEnabled  = true;
  let soundEnabled    = false;
  let speedMultiplier = 1;
  let replayTimers    = [];
  let rafId           = null;
  let introRafId      = null;
  let audioCtx        = null;
  let savedHTMLMap    = new Map();
  let builtCount      = 0;

  // ─── Audio ─────────────────────────────────────────────────────────────────
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
      let els;
      try { els = document.querySelectorAll(item.sel); } catch(_) { return; }
      els.forEach((el, idx) => {
        if (!seen.has(el)) {
          seen.add(el);
          const hasComplex = el.querySelectorAll('div, svg, img').length > 0;
          const mode = (item.type === 'text' && !hasComplex) ? 'text' : 'box';
          list.push({ el, label: idx > 0 ? `${item.label}_${idx+1}` : item.label, mode });
        }
      });
    });
    // Sort by absolute Y so sections are top-to-bottom
    list.sort((a, b) => {
      const ay = a.el.getBoundingClientRect().top + window.scrollY;
      const by = b.el.getBoundingClientRect().top + window.scrollY;
      return ay - by;
    });
    return list;
  }

  // ─── Main Init ─────────────────────────────────────────────────────────────
  function initSwarmReplay() {
    const overlay = document.createElement('div');
    overlay.id = 'agent-replay-overlay';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    // ── 4 track overlays (guide lines hidden via CSS) ──────────────────────
    const tracks = [];
    for (let t = 0; t < NUM_TRACKS; t++) {
      const guideH = document.createElement('div');
      guideH.className = 'agent-guide-h';
      const guideV = document.createElement('div');
      guideV.className = 'agent-guide-v';
      const bbox = document.createElement('div');
      bbox.className = 'agent-bbox';
      bbox.style.opacity = '0';
      bbox.innerHTML = `
        <span class="agent-bbox-handle tl"></span><span class="agent-bbox-handle tr"></span>
        <span class="agent-bbox-handle bl"></span><span class="agent-bbox-handle br"></span>
        <span class="agent-bbox-tag" id="bbox-tag-${t}">Layer</span>
        <span class="agent-bbox-dim" id="bbox-dim-${t}">0×0</span>
      `;
      overlay.appendChild(guideH);
      overlay.appendChild(guideV);
      overlay.appendChild(bbox);
      tracks.push({
        t,
        bbox, guideH, guideV,
        bboxTag: null, bboxDim: null,
        currentEl: null,
        currentRect: null,  // last known rect (screen-space, cached at build time)
      });
    }
    tracks.forEach((tr, t) => {
      tr.bboxTag = document.getElementById(`bbox-tag-${t}`);
      tr.bboxDim = document.getElementById(`bbox-dim-${t}`);
    });

    // ── 18 cursors ─────────────────────────────────────────────────────────
    // Zone layout: 4 cols × 5 rows = 20 zones (use first 18).
    // Zones cover the FULL VIEWPORT — spread is guaranteed.
    const ZONE_COLS = 4;
    const ZONE_ROWS = 5;
    const agents = [];

    for (let i = 0; i < MAX_AGENTS; i++) {
      const color = AGENT_COLORS[i];
      const cur   = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.cssText = 'opacity:0;position:fixed;pointer-events:none;z-index:9999;left:0;top:0;will-change:transform;';
      cur.innerHTML = `${createPointerSVG(color)}<div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i]}</div>`;
      overlay.appendChild(cur);

      // Zone center (normalized 0-1 of viewport)
      const col = i % ZONE_COLS;
      const row = Math.floor(i / ZONE_COLS) % ZONE_ROWS;
      const zoneNx = (col + 0.5) / ZONE_COLS;
      const zoneNy = (row + 0.5) / ZONE_ROWS;

      agents.push({
        cur, color,
        x: 0, y: 0,         // current screen position
        tx: 0, ty: 0,       // stable target (updated only on arrival or new element)
        wanderSeed: Math.random() * Math.PI * 2, // phase for smooth wander
        wanderT: 0,          // time accumulator for wander
        zoneNx, zoneNy,
        trackIdx: -1,
        active: false,
        opacity: 0,          // current rendered opacity (for smooth fade)
        targetOpacity: 0,
      });
    }

    // ── Dock ───────────────────────────────────────────────────────────────
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
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">14 agents</span>
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

    // ── Helpers ─────────────────────────────────────────────────────────────
    function clearTimers() {
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      if (rafId)      { cancelAnimationFrame(rafId);      rafId      = null; }
      if (introRafId) { cancelAnimationFrame(introRafId); introRafId = null; }
    }

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.innerHTML = html;
      });
      savedHTMLMap.clear();
    }

    function stopReplay(completed = false, total = 0) {
      isReplaying = false;
      clearTimers();
      restoreAllSavedText();
      document.querySelectorAll('.swarm-blank-layer,.swarm-wireframe-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer','swarm-wireframe-layer');
        el.classList.add('swarm-built-layer');
      });
      overlay.style.display = 'none';
      tracks.forEach(tr => {
        tr.bbox.style.opacity = '0';
        tr.currentEl = null;
        tr.currentRect = null;
      });
      agents.forEach(a => {
        a.cur.style.opacity = '0';
        a.active = false;
        a.trackIdx = -1;
        a.opacity = 0;
        a.targetOpacity = 0;
      });
      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600','hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600','hover:bg-brand-500');
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

    // ── Dynamic agent activation (14-18, varies every 30 layers) ───────────
    // Count changes smoothly: every 30 layers built, step +1 (cycle 14→18→14…)
    function getLiveCount() {
      return MIN_AGENTS + (Math.floor(builtCount / 30) % (MAX_AGENTS - MIN_AGENTS + 1));
    }

    // Assign tracks to active agents, spread across all 4 tracks
    function updateAgentActivation(liveCount) {
      agents.forEach((a, i) => {
        const shouldActive = i < liveCount;
        a.targetOpacity = shouldActive ? 1 : 0;
        if (shouldActive) {
          if (!a.active) {
            // Newly activated: spawn at zone center
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            a.x  = a.zoneNx * vw + (Math.random()-0.5)*40;
            a.y  = a.zoneNy * vh + (Math.random()-0.5)*40;
            a.tx = a.x; a.ty = a.y;
            a.active = true;
            a.wanderT = Math.random() * 100;
          }
          // Distribute agents across NUM_TRACKS: each track gets liveCount/NUM_TRACKS agents
          a.trackIdx = Math.floor(i * NUM_TRACKS / liveCount);
        } else {
          a.active   = false;
          a.trackIdx = -1;
        }
      });
      statusText.textContent = `${liveCount} agents • ${builtCount}/`;
    }

    // ── Pick wandering target for an agent in its zone ──────────────────────
    // Called when agent arrives at target. Uses zone center + small random offset.
    // No getBoundingClientRect() — purely viewport-relative.
    function pickWanderTarget(a) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const zx = a.zoneNx * vw;
      const zy = a.zoneNy * vh;
      // Wander radius: 15% of viewport in each direction
      const rx = vw * 0.14;
      const ry = vh * 0.14;
      a.tx = Math.max(10, Math.min(vw - 90, zx + (Math.random()-0.5)*2*rx));
      a.ty = Math.max(10, Math.min(vh - 60, zy + (Math.random()-0.5)*2*ry));
    }

    // ── Compute target biased toward element (if agent has an active task) ─
    // Called once at build time (not in RAF). Uses screen-space rect passed in.
    function computeTaskTarget(a, rect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const zx = a.zoneNx * vw;
      const zy = a.zoneNy * vh;
      const ex = rect.left + rect.width  / 2;
      const ey = rect.top  + rect.height / 2;
      // 50% zone + 50% element, small jitter
      const bx = zx * 0.5 + ex * 0.5 + (Math.random()-0.5)*50;
      const by = zy * 0.5 + ey * 0.5 + (Math.random()-0.5)*35;
      a.tx = Math.max(10, Math.min(vw - 90, bx));
      a.ty = Math.max(10, Math.min(vh - 60, by));
    }

    // ── 60fps physics — ZERO getBoundingClientRect() ────────────────────────
    // Agents move toward stable a.tx, a.ty (computed at build-time).
    // On arrival → wander within zone (keeps every agent moving).
    let lastPhysicsTime = 0;

    function physicsLoop(now) {
      if (!isReplaying) return;
      rafId = requestAnimationFrame(physicsLoop);

      const dt = Math.min((now - lastPhysicsTime) / 1000, 0.05);
      lastPhysicsTime = now;

      agents.forEach(a => {
        // Smooth fade in/out
        if (a.opacity !== a.targetOpacity) {
          const fadeSpeed = dt * 3; // fade over ~0.33s
          if (a.targetOpacity > a.opacity) {
            a.opacity = Math.min(a.targetOpacity, a.opacity + fadeSpeed);
          } else {
            a.opacity = Math.max(a.targetOpacity, a.opacity - fadeSpeed);
          }
          a.cur.style.opacity = a.opacity.toFixed(3);
          if (a.opacity <= 0) { a.cur.style.opacity = '0'; return; }
        } else if (a.targetOpacity === 0) {
          a.cur.style.opacity = '0';
          return;
        }

        const dx   = a.tx - a.x;
        const dy   = a.ty - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8) {
          // Arrived — pick new wander target within zone
          a.x = a.tx; a.y = a.ty;
          pickWanderTarget(a);
        } else {
          // Fast approach → eases in final 60px (easeOut)
          const closeEnough = 60;
          let speed;
          if (dist > closeEnough) {
            speed = Math.max(700, dist * 6);
          } else {
            // Ease out: speed drops linearly from 700 to 180 over last 60px
            const t = dist / closeEnough;
            speed = 180 + t * (700 - 180);
          }
          const step = Math.min(dist, speed * dt);
          a.x += (dx / dist) * step;
          a.y += (dy / dist) * step;
        }

        a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
      });
    }

    // ── Assign track to element (called at each layer build) ────────────────
    // ONLY place getBoundingClientRect() is called. NOT in RAF.
    function assignTrackElement(tr, item, rect) {
      tr.currentEl   = item.el;
      tr.currentRect = rect;

      if (rect.width > 0 && rect.height > 0) {
        tr.bbox.style.opacity = '1';
        tr.bbox.style.left   = `${rect.left}px`;
        tr.bbox.style.top    = `${rect.top}px`;
        tr.bbox.style.width  = `${rect.width}px`;
        tr.bbox.style.height = `${rect.height}px`;
        if (tr.bboxTag) tr.bboxTag.textContent = item.label;
        if (tr.bboxDim) tr.bboxDim.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
      }

      // Update task targets for all agents assigned to this track
      agents.forEach(a => {
        if (a.active && a.trackIdx === tr.t) {
          computeTaskTarget(a, rect);
        }
      });
    }

    // ── Touring scroll ──────────────────────────────────────────────────────
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
          scrollRafId = null; return;
        }
        const d  = Math.abs(diff);
        const px = d > 120 ? Math.sign(diff)*Math.max(60,d*0.20) : Math.sign(diff)*Math.max(3,d*0.11);
        scrollCurrent += px;
        window.scrollTo({ top: scrollCurrent, behavior: 'instant' });
        scrollRafId = requestAnimationFrame(step);
      }
      scrollRafId = requestAnimationFrame(step);
    }

    // ── 1.7s Intro ribbons ──────────────────────────────────────────────────
    // All MAX_AGENTS visible in 2 horizontal ribbon streams.
    // Agents wander across full viewport width + height bands.
    function runIntro(onDone) {
      overlay.style.display = 'block';
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Seed intro positions spread across screen
      const ipos = agents.map((a, i) => {
        const col = i % ZONE_COLS;
        const row = Math.floor(i / ZONE_COLS) % ZONE_ROWS;
        const x = ((col + 0.5) / ZONE_COLS) * vw + (Math.random()-0.5)*40;
        const y = ((row + 0.5) / ZONE_ROWS) * vh + (Math.random()-0.5)*30;
        a.cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        a.cur.style.opacity   = '1';
        a.opacity = 1;
        a.targetOpacity = 1;
        return { x, y, vx: (Math.random()-0.5)*1.2, vy: (Math.random()-0.5)*0.8 };
      });

      let introStart = null;
      function introFrame(now) {
        if (!isReplaying) { introRafId = null; return; }
        if (!introStart) introStart = now;
        const elapsed = now - introStart;
        const frac    = Math.min(elapsed / INTRO_DUR, 1);
        const cvw = window.innerWidth;
        const cvh = window.innerHeight;

        agents.forEach((a, i) => {
          const ip = ipos[i];
          // Gentle drift during intro
          ip.x += ip.vx;
          ip.y += ip.vy;
          // Bounce off edges
          if (ip.x < 10)       { ip.x = 10;       ip.vx =  Math.abs(ip.vx); }
          if (ip.x > cvw - 90) { ip.x = cvw - 90; ip.vx = -Math.abs(ip.vx); }
          if (ip.y < 10)       { ip.y = 10;        ip.vy =  Math.abs(ip.vy); }
          if (ip.y > cvh - 60) { ip.y = cvh - 60;  ip.vy = -Math.abs(ip.vy); }
          a.cur.style.transform = `translate3d(${ip.x.toFixed(1)}px,${ip.y.toFixed(1)}px,0)`;
        });

        if (elapsed >= INTRO_DUR) {
          introRafId = null;
          // Seed physics positions from final intro positions
          agents.forEach((a, i) => {
            a.x = ipos[i].x; a.y = ipos[i].y;
            a.tx = a.x; a.ty = a.y;
          });
          onDone();
          return;
        }
        introRafId = requestAnimationFrame(introFrame);
      }
      introRafId = requestAnimationFrame(introFrame);
    }

    // ── Main Replay ─────────────────────────────────────────────────────────
    function startReplay() {
      if (isReplaying) { isReplaying=false; clearTimers(); restoreAllSavedText(); }
      if (introRafId)  { cancelAnimationFrame(introRafId); introRafId=null; }

      isReplaying = true;
      builtCount  = 0;

      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top:0, behavior:'instant' });
      scrollCurrent = 0; scrollTarget = 0;

      const layers = collectLayers();
      const total  = layers.length;

      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer','swarm-wireframe-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600','hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600','hover:bg-emerald-500');
      statusText.textContent = `${MIN_AGENTS} agents • 0/${total}`;

      // All agents hidden at start (intro will show them)
      agents.forEach(a => {
        a.active = false;
        a.trackIdx = -1;
        a.opacity = 0;
        a.targetOpacity = 0;
        a.cur.style.opacity = '0';
      });
      tracks.forEach(tr => { tr.currentEl=null; tr.currentRect=null; tr.bbox.style.opacity='0'; });

      // Run intro then start building
      runIntro(() => {
        if (!isReplaying) return;

        // Activate initial liveCount agents
        updateAgentActivation(getLiveCount());

        // Start physics loop AFTER intro completes
        lastPhysicsTime = performance.now();
        rafId = requestAnimationFrame(physicsLoop);

        // ── Section-based layer split ──────────────────────────────────────
        // Track 0 = top 25% of layers (top of page)
        // Track 1 = next 25%, Track 2 = next 25%, Track 3 = bottom 25%
        // → agents of different tracks work at DIFFERENT Y positions → full spread
        const chunkSize = Math.ceil(total / NUM_TRACKS);
        const trackLayers = tracks.map((_, t) =>
          layers.slice(t * chunkSize, (t+1) * chunkSize)
        );

        const BASE_MS = 280; // ms per layer at 1x

        tracks.forEach((tr, t) => {
          if (trackLayers[t].length === 0) return;

          // Stagger start: each track begins 80ms after previous
          const startOffset = t * Math.round(80 / speedMultiplier);
          let delay = startOffset;

          trackLayers[t].forEach((item) => {
            const stepMs = Math.max(55, Math.round(BASE_MS / speedMultiplier));

            // Phase A: wireframe (slightly before build)
            replayTimers.push(setTimeout(() => {
              if (!isReplaying) return;
              item.el.classList.remove('swarm-blank-layer');
              item.el.classList.add('swarm-wireframe-layer');
              playWireframeSound();
            }, Math.max(0, delay - Math.round(100/speedMultiplier))));

            // Phase B: build
            replayTimers.push(setTimeout(() => {
              if (!isReplaying) return;

              const rect = item.el.getBoundingClientRect();

              // Touring: follow track 1 (middle section = best viewing window)
              if (touringEnabled && t === 1) {
                if (rect.top > window.innerHeight * 0.65 || rect.bottom < 60) {
                  touringScrollTo(window.scrollY + rect.top - window.innerHeight * 0.35);
                }
              }

              assignTrackElement(tr, item, rect);

              item.el.classList.remove('swarm-wireframe-layer');
              item.el.classList.add('swarm-built-layer');

              if (item.mode === 'text') typeElementText(item.el, speedMultiplier);
              else playSnapSound();

              builtCount++;

              // Vary agent count every 30 layers (14 → 15 → 16 → 17 → 18 → 14 …)
              if (builtCount % 30 === 0) {
                updateAgentActivation(getLiveCount());
              }
              statusText.textContent = `${getLiveCount()} agents • ${builtCount}/${total}`;

              if (builtCount >= total) {
                replayTimers.push(setTimeout(() => stopReplay(true, total),
                  Math.round(600 / speedMultiplier)));
              }
            }, delay));

            delay += stepMs;
          });
        });
      });
    }

    // ── Button Events ───────────────────────────────────────────────────────
    actionBtn.addEventListener('click', () => {
      ensureAudio();
      if (isReplaying) stopReplay(false); else startReplay();
    });
    tourBtn.addEventListener('click', () => {
      touringEnabled = !touringEnabled;
      tourBtn.className = touringEnabled
        ? 'px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors'
        : 'px-2.5 py-0.5 rounded-full bg-[#1a1f2e] text-gray-500 border border-[#2d364d] hover:text-gray-300 transition-colors';
    });
    speedBtn.addEventListener('click', () => {
      speedMultiplier = speedMultiplier===1?2:speedMultiplier===2?3:1;
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
      dock.style.display='none';
      miniPill.classList.remove('hidden'); miniPill.classList.add('flex');
    });
    miniPill.addEventListener('click', () => {
      miniPill.classList.add('hidden'); miniPill.classList.remove('flex');
      dock.style.display='flex';
      startReplay();
    });

    // Auto-start after brief delay
    setTimeout(() => { startReplay(); }, 300);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
