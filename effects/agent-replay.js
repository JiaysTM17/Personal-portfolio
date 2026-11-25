// Swarm Rebuild — Authentic Full-Page Multi-Agent UI/UX Build Replay
// Clears the canvas, sketches wireframes, types headings with I-beam carets,
// aligns bounding boxes with 18 agent cursors, supports 1x/2x/3x speed, Touring auto-scroll & Web Audio SFX.

(function () {
  const AGENT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6'
  ];

  const AGENT_NAMES = [
    'Layout-AI', 'UI-Core', 'Type-Bot', 'Grid-Sys',
    'Style-V3', 'Hero-Bot', 'Card-AI', 'Nav-Bot',
    'Motion-1', 'Bento-AI', 'DOM-Sync', 'Pixel-QA',
    'Rim-FX', 'Flex-Bot', 'Meta-AI', 'Wire-AI',
    'Font-Bot', 'Deploy-1'
  ];

  // Collect layers across the ENTIRE page from top to bottom
  const LAYER_QUERY = [
    { sel: 'header a.group', label: 'BrandLogo', type: 'box' },
    { sel: 'header nav a', label: 'NavLink', type: 'text' },
    { sel: 'header .hidden.md\\:flex', label: 'HeaderActions', type: 'box' },
    { sel: '#hero .inline-flex.rounded-full', label: 'StudentBadge', type: 'box' },
    { sel: '#hero .font-handwriting', label: 'Greeting', type: 'text' },
    { sel: '#hero h1', label: 'HeroTitle', type: 'text' },
    { sel: '#hero h2', label: 'RoleTitle', type: 'text' },
    { sel: '#hero p.text-gray-300', label: 'HeroBio', type: 'box' },
    { sel: '#hero .font-display.font-black.tracking-tighter', label: 'PortfolioBg', type: 'box' },
    { sel: '#hero img[alt*="Trương Gia Kiệt"]', label: 'PortraitCutout', type: 'box' },
    { sel: '#hero a[href="#works"]', label: 'PrimaryCTA', type: 'box' },
    { sel: '#hero a[href*="github.com"]', label: 'GitHubCTA', type: 'box' },
    { sel: '#hero .flex.flex-wrap.items-center.gap-5', label: 'QuickContact', type: 'box' },
    { sel: '#hero .md\\:col-span-2 > a', label: 'HeroStat', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2', label: 'BentoHeading', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6', label: 'BentoCard', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7', label: 'TechMatrix', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5', label: 'StudioClock', type: 'box' },
    { sel: '#works h2', label: 'WorksTitle', type: 'text' },
    { sel: '#project-filters button', label: 'FilterTab', type: 'box' },
    { sel: '#projects-grid .project-card', label: 'ProjectCard', type: 'box' },
    { sel: '#services h2', label: 'ServicesTitle', type: 'text' },
    { sel: '#services .accordion-item', label: 'TechAccordion', type: 'box' },
    { sel: '#docs h2', label: 'DocsTitle', type: 'text' },
    { sel: '#docs .space-y-4 > div', label: 'ArchitectureDoc', type: 'box' },
    { sel: '#about h2', label: 'AboutTitle', type: 'text' },
    { sel: '#about .lg\\:col-span-6', label: 'AboutColumn', type: 'box' },
    { sel: '#journey h2', label: 'JourneyTitle', type: 'text' },
    { sel: '#journey .space-y-6 > div', label: 'TimelineItem', type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\]', label: 'ResumeCard', type: 'box' },
    { sel: '#contact h2', label: 'ContactTitle', type: 'text' },
    { sel: '#contact #copy-email-btn', label: 'EmailCopyCard', type: 'box' },
    { sel: '#contact-form', label: 'ContactForm', type: 'box' },
    { sel: 'footer', label: 'Footer', type: 'box' }
  ];

  let isReplaying = false;
  let touringEnabled = true;
  let soundEnabled = false; // User can toggle sound ON anytime
  let speedMultiplier = 1;  // Cycles 1 -> 2 -> 3
  let replayTimers = [];
  let cursorLoopId = null;
  let audioCtx = null;
  let savedHTMLMap = new Map();

  // Web Audio API Synthesizer for crisp UI design sounds (no external files required)
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playTone(freq, duration, vol = 0.03, type = 'sine') {
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playWireframeSound() { playTone(520 + Math.random() * 140, 0.04, 0.02, 'triangle'); }
  function playTypeSound() { playTone(780 + Math.random() * 200, 0.025, 0.015, 'square'); }
  function playSnapSound() { playTone(380 + Math.random() * 180, 0.05, 0.025, 'sine'); }
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
          // Only animate typing on leaf-ish elements or headings with simple structure
          const hasComplexChildren = el.querySelectorAll('div, svg, img').length > 0;
          const mode = (item.type === 'text' && !hasComplexChildren) ? 'text' : 'box';
          list.push({
            el,
            label: idx > 0 ? `${item.label}_${idx + 1}` : item.label,
            mode
          });
        }
      });
    });
    // Sort top-to-bottom by document offsetTop so Touring scrolls naturally downward
    list.sort((a, b) => {
      const ay = a.el.getBoundingClientRect().top + window.scrollY;
      const by = b.el.getBoundingClientRect().top + window.scrollY;
      return ay - by;
    });
    return list;
  }

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

    // 18 Multiplayer Agent Cursors
    const cursors = [];
    for (let i = 0; i < 18; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.opacity = '0';
      cur.style.transform = `translate3d(${window.innerWidth * 0.5}px, ${window.innerHeight * 0.4}px, 0)`;
      cur.innerHTML = `
        ${createPointerSVG(color)}
        <div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i % AGENT_NAMES.length]}</div>
      `;
      overlay.appendChild(cur);
      cursors.push(cur);
    }

    document.body.appendChild(overlay);

    // Floating Control Dock
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
      <button id="replay-tour-btn" type="button" title="Tự động cuộn theo tiến trình thiết kế" class="px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors">Touring</button>
      <button id="replay-speed-btn" type="button" title="Tốc độ 1x / 2x / 3x" class="px-2 py-0.5 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-200 border border-[#2d364d] transition-colors">1x</button>
      <button id="replay-sound-btn" type="button" title="Bật / Tắt âm thanh thiết kế" class="px-2 py-0.5 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-400 border border-[#2d364d] transition-colors">🔇</button>
      <button id="replay-action-btn" type="button" class="px-3 py-1 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors whitespace-nowrap">Replay</button>
      <button id="replay-minimize-btn" type="button" title="Thu gọn thanh điều khiển" class="text-gray-400 hover:text-white px-1 transition-colors">×</button>
    `;
    document.body.appendChild(dock);

    const miniPill = document.createElement('button');
    miniPill.id = 'agent-replay-mini';
    miniPill.type = 'button';
    miniPill.className = 'fixed bottom-5 left-5 z-[95] hidden items-center gap-1.5 bg-[#12141a]/95 backdrop-blur-md border border-brand-500/50 hover:border-brand-400 text-brand-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-xl transition-all';
    miniPill.innerHTML = '<span>✦</span><span>Swarm Replay</span>';
    document.body.appendChild(miniPill);

    const statusText = document.getElementById('replay-status-text');
    const tourBtn = document.getElementById('replay-tour-btn');
    const speedBtn = document.getElementById('replay-speed-btn');
    const soundBtn = document.getElementById('replay-sound-btn');
    const actionBtn = document.getElementById('replay-action-btn');
    const minimizeBtn = document.getElementById('replay-minimize-btn');
    const bboxTag = document.getElementById('bbox-tag');
    const bboxDim = document.getElementById('bbox-dim');

    function clearTimers() {
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      if (cursorLoopId) {
        clearInterval(cursorLoopId);
        cursorLoopId = null;
      }
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
      cursors.forEach(c => (c.style.opacity = '0'));

      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');

      if (completed) {
        playCompleteSound();
        statusText.textContent = `18 agents • ${totalCount}/${totalCount} layers`;
      } else {
        statusText.textContent = '18 agents • Live';
      }
    }

    function moveCursors(activeRect) {
      cursors.forEach((cur, idx) => {
        cur.style.opacity = '1';
        if (activeRect && idx < 6) {
          const rx = activeRect.left + Math.random() * Math.max(50, activeRect.width);
          const ry = activeRect.top + Math.random() * Math.max(30, activeRect.height);
          cur.style.transform = `translate3d(${Math.min(window.innerWidth - 80, Math.max(10, rx))}px, ${Math.min(window.innerHeight - 60, Math.max(10, ry))}px, 0)`;
        } else {
          const rx = 30 + Math.random() * (window.innerWidth - 130);
          const ry = 50 + Math.random() * (window.innerHeight - 130);
          cur.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        }
      });
    }

    function typeElementText(el, speed) {
      if (!savedHTMLMap.has(el)) {
        savedHTMLMap.set(el, el.innerHTML);
      }
      const fullText = el.textContent.trim();
      if (!fullText) return;

      el.textContent = '';
      el.classList.add('swarm-typing-caret');
      const stepChars = Math.max(1, Math.ceil(fullText.length / 10));
      let pos = 0;

      const typeTick = () => {
        if (!isReplaying) return;
        pos += stepChars;
        if (pos >= fullText.length) {
          el.classList.remove('swarm-typing-caret');
          if (savedHTMLMap.has(el)) {
            el.innerHTML = savedHTMLMap.get(el);
            savedHTMLMap.delete(el);
          }
          return;
        }
        el.textContent = fullText.slice(0, pos);
        playTypeSound();
        const t = setTimeout(typeTick, Math.max(18, Math.round(36 / speed)));
        replayTimers.push(t);
      };
      typeTick();
    }

    function startReplay() {
      if (isReplaying) stopReplay(false);
      isReplaying = true;
      clearTimers();

      // Scroll to top immediately to start blank-canvas rebuild from Header
      window.scrollTo({ top: 0, behavior: 'instant' });

      const layers = collectLayers();
      const total = layers.length;

      // Step 1: BLANK CANVAS — hide all layers completely!
      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer', 'swarm-wireframe-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      statusText.textContent = `18 agents • 0/${total}`;

      let activeRect = null;
      moveCursors(null);

      // Continuous multi-agent cursor swarm
      cursorLoopId = setInterval(() => {
        if (isReplaying) moveCursors(activeRect);
      }, Math.max(140, Math.round(360 / speedMultiplier)));

      let currentDelay = 120;

      layers.forEach((item, idx) => {
        const baseInterval = item.mode === 'text' ? 210 : 145;
        const stepDelay = Math.max(45, Math.round(baseInterval / speedMultiplier));

        // Phase A: Draw wireframe sketch first
        const wireTimer = setTimeout(() => {
          if (!isReplaying) return;
          item.el.classList.remove('swarm-blank-layer');
          item.el.classList.add('swarm-wireframe-layer');
          playWireframeSound();
        }, Math.max(0, currentDelay - Math.round(90 / speedMultiplier)));
        replayTimers.push(wireTimer);

        // Phase B: Build, align bounding box, type text & auto-scroll if Touring is ON
        const buildTimer = setTimeout(() => {
          if (!isReplaying) return;

          // Touring Auto-Scroll: keep active layer comfortably in viewport
          if (touringEnabled) {
            const r = item.el.getBoundingClientRect();
            if (r.top > window.innerHeight * 0.68 || r.bottom < 80) {
              const targetY = Math.max(0, window.scrollY + r.top - window.innerHeight * 0.32);
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            }
          }

          const rect = item.el.getBoundingClientRect();
          activeRect = rect;

          statusText.textContent = `18 agents • ${idx + 1}/${total}`;

          if (rect.width > 0 && rect.height > 0) {
            bbox.style.opacity = '1';
            bbox.style.left = `${rect.left}px`;
            bbox.style.top = `${rect.top}px`;
            bbox.style.width = `${rect.width}px`;
            bbox.style.height = `${rect.height}px`;
            bboxTag.textContent = item.label;
            bboxDim.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

            guideH.style.opacity = '1';
            guideH.style.top = `${rect.top}px`;
            guideV.style.opacity = '1';
            guideV.style.left = `${rect.left}px`;
          }

          item.el.classList.remove('swarm-wireframe-layer');
          item.el.classList.add('swarm-built-layer');

          if (item.mode === 'text') {
            typeElementText(item.el, speedMultiplier);
          } else {
            playSnapSound();
          }

          moveCursors(rect);

          if (idx === total - 1) {
            const doneTimer = setTimeout(() => stopReplay(true, total), Math.round(450 / speedMultiplier));
            replayTimers.push(doneTimer);
          }
        }, currentDelay);

        replayTimers.push(buildTimer);
        currentDelay += stepDelay;
      });
    }

    // Button Controls
    actionBtn.addEventListener('click', () => {
      ensureAudio();
      if (isReplaying) {
        stopReplay(false);
      } else {
        startReplay();
      }
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
      if (isReplaying) {
        // Restart cleanly at new speed
        startReplay();
      }
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

    // Auto-start full blank-canvas build replay on load
    setTimeout(() => {
      startReplay();
    }, 300);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
