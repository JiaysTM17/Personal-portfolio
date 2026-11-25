// Swarm Rebuild — Authentic Full-Page Multi-Agent UI/UX Build Replay
// Clears the canvas, sketches wireframes, types headings with I-beam carets,
// dynamically scales 14–18 agent cursors, supports live 1x/2x/3x speed, Touring auto-scroll & Web Audio SFX.

(function () {
  const MIN_AGENTS = 14;
  const MAX_AGENTS = 18;

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

  // Granular selectors across the ENTIRE page (300+ layers)
  const LAYER_QUERY = [
    { sel: 'header a.group span', label: 'BrandLogo', type: 'text' },
    { sel: 'header nav a', label: 'NavLink', type: 'text' },
    { sel: 'header button, header a.rounded-full, header a.rounded-lg', label: 'HeaderAction', type: 'box' },
    { sel: '#hero .inline-flex.rounded-full, #hero .inline-flex.rounded-full span', label: 'StudentBadge', type: 'box' },
    { sel: '#hero .font-handwriting', label: 'Greeting', type: 'text' },
    { sel: '#hero h1, #hero h1 span', label: 'HeroTitle', type: 'text' },
    { sel: '#hero h2', label: 'RoleTitle', type: 'text' },
    { sel: '#hero p', label: 'HeroBio', type: 'text' },
    { sel: '#hero .font-display.font-black.tracking-tighter', label: 'PortfolioBg', type: 'box' },
    { sel: '#hero img[alt*="Trương Gia Kiệt"]', label: 'PortraitCutout', type: 'box' },
    { sel: '#hero a', label: 'HeroCTA', type: 'box' },
    { sel: '#hero .md\\:col-span-2 > a, #hero .md\\:col-span-2 > a > div', label: 'HeroStat', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2, section.bg-\\[\\#0b0c10\\] h3', label: 'BentoHeading', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] p', label: 'BentoCopy', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] span, section.bg-\\[\\#0b0c10\\] a, section.bg-\\[\\#0b0c10\\] button', label: 'BentoItem', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6, section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7, section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5', label: 'BentoCard', type: 'box' },
    { sel: '#works h2, #works h3', label: 'WorksHeading', type: 'text' },
    { sel: '#works p', label: 'WorksDesc', type: 'text' },
    { sel: '#project-filters button', label: 'FilterTab', type: 'box' },
    { sel: '#projects-grid .project-card', label: 'ProjectCard', type: 'box' },
    { sel: '#projects-grid .project-card img', label: 'ProjectThumb', type: 'box' },
    { sel: '#projects-grid .project-card span, #projects-grid .project-card a, #projects-grid .project-card button', label: 'ProjectMeta', type: 'box' },
    { sel: '#services h2, #services h3', label: 'ServicesHeading', type: 'text' },
    { sel: '#services p', label: 'ServicesCopy', type: 'text' },
    { sel: '#services .accordion-item, #services .accordion-item button, #services .accordion-item span, #services .accordion-item li', label: 'TechItem', type: 'box' },
    { sel: '#docs h2, #docs h3', label: 'DocsHeading', type: 'text' },
    { sel: '#docs p', label: 'DocsCopy', type: 'text' },
    { sel: '#docs .space-y-4 > div, #docs span, #docs a, #docs button', label: 'DocNode', type: 'box' },
    { sel: '#about h2, #about h3', label: 'AboutHeading', type: 'text' },
    { sel: '#about p', label: 'AboutCopy', type: 'text' },
    { sel: '#about img, #about span, #about .rounded-xl, #about .rounded-2xl', label: 'AboutDetail', type: 'box' },
    { sel: '#journey h2, #journey h3', label: 'JourneyHeading', type: 'text' },
    { sel: '#journey p', label: 'JourneyCopy', type: 'text' },
    { sel: '#journey .space-y-6 > div, #journey span, #journey a, #journey li', label: 'TimelineNode', type: 'box' },
    { sel: '#contact h2, #contact h3', label: 'ContactHeading', type: 'text' },
    { sel: '#contact p, #contact label', label: 'ContactLabel', type: 'text' },
    { sel: '#contact #copy-email-btn, #contact input, #contact textarea, #contact button, #contact a, #contact span', label: 'ContactControl', type: 'box' },
    { sel: 'footer a, footer p, footer span, footer button', label: 'FooterItem', type: 'box' },
    // Broad granular sweep so no visible sub-element is left behind
    { sel: 'main section h4, main section li, main section svg, main section img, main section span, main section a, main section button, main section p', label: 'UILayer', type: 'box' }
  ];

  let isReplaying = false;
  let touringEnabled = true;
  let soundEnabled = false;
  let speedMultiplier = 1; // 1x -> 2x -> 3x
  let rafId = null;
  let lastTs = 0;
  let cursorAccum = 0;
  let stepAccum = 0;
  let scrollFloatY = 0;
  let targetScrollY = 0;
  let activeAgentsCount = 16;

  let replayTimers = [];
  let audioCtx = null;
  let savedHTMLMap = new Map();

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

  function playWireframeSound() { playTone(520 + Math.random() * 140, 0.04, 0.018, 'triangle'); }
  function playTypeSound() { playTone(780 + Math.random() * 200, 0.025, 0.014, 'square'); }
  function playSnapSound() { playTone(380 + Math.random() * 180, 0.045, 0.022, 'sine'); }
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
    const scrollY = window.scrollY || 0;

    LAYER_QUERY.forEach(item => {
      let els = [];
      try {
        els = document.querySelectorAll(item.sel);
      } catch (_) {
        return;
      }
      els.forEach((el, idx) => {
        if (seen.has(el)) return;
        if (el.closest('#agent-replay-overlay') || el.closest('#agent-replay-dock') || el.closest('#agent-replay-mini')) return;
        if (el.closest('.fixed')) return;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

        const rect = el.getBoundingClientRect();
        if (rect.width < 6 || rect.height < 6) return;
        if (rect.width > window.innerWidth * 0.98 && rect.height > window.innerHeight * 0.96) return;

        seen.add(el);
        const hasComplexChildren = el.querySelectorAll('div, svg, img').length > 0;
        const mode = (item.type === 'text' && !hasComplexChildren) ? 'text' : 'box';
        list.push({
          el,
          absTop: rect.top + scrollY,
          absLeft: rect.left + (window.scrollX || 0),
          label: idx > 0 ? `${item.label}_${idx + 1}` : item.label,
          mode
        });
      });
    });

    // Sort top-to-bottom by document offsetTop so Touring scrolls naturally downward
    list.sort((a, b) => {
      if (Math.abs(a.absTop - b.absTop) > 10) return a.absTop - b.absTop;
      return a.absLeft - b.absLeft;
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

    // Pool of 18 Multiplayer Agent Cursors (dynamically 14–18 active)
    const cursors = [];
    const cursorStates = [];
    for (let i = 0; i < MAX_AGENTS; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.opacity = '0';
      const startX = window.innerWidth * (0.2 + Math.random() * 0.6);
      const startY = window.innerHeight * (0.2 + Math.random() * 0.5);
      cur.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
      cur.innerHTML = `
        ${createPointerSVG(color)}
        <div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i % AGENT_NAMES.length]}</div>
      `;
      overlay.appendChild(cur);
      cursors.push(cur);
      cursorStates.push({
        x: startX,
        y: startY,
        tx: startX,
        ty: startY,
        speed: 240 + (i % 5) * 42,
        phase: i * 0.9,
      });
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
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">16 agents</span>
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
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
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
      document.documentElement.style.scrollBehavior = '';

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
        statusText.textContent = `${activeAgentsCount} agents • ${totalCount}/${totalCount} layers`;
      } else {
        statusText.textContent = `${activeAgentsCount} agents • Live`;
      }
    }

    function pickCursorTarget(cs, idx, activeRect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (activeRect && idx < 6) {
        const padX = Math.max(60, activeRect.width + 40);
        const padY = Math.max(40, activeRect.height + 30);
        cs.tx = Math.min(vw - 75, Math.max(12, activeRect.left - 15 + Math.random() * padX));
        cs.ty = Math.min(vh - 55, Math.max(12, activeRect.top - 10 + Math.random() * padY));
      } else {
        cs.tx = 28 + Math.random() * Math.max(120, vw - 140);
        cs.ty = 48 + Math.random() * Math.max(120, vh - 140);
      }
    }

    function updateCursorsContinuous(dt, simTime, activeRect) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (let idx = 0; idx < MAX_AGENTS; idx++) {
        const cur = cursors[idx];
        const cs = cursorStates[idx];
        if (idx >= activeAgentsCount) {
          cur.style.opacity = '0';
          continue;
        }
        cur.style.opacity = '1';

        const dx = cs.tx - cs.x;
        const dy = cs.ty - cs.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 18) {
          pickCursorTarget(cs, idx, activeRect);
        } else {
          const step = Math.min(dist, cs.speed * dt);
          cs.x += (dx / dist) * step;
          cs.y += (dy / dist) * step;
        }

        // Subtle continuous drift so no cursor ever appears frozen
        const driftX = Math.sin(simTime * 2.4 + cs.phase) * 5;
        const driftY = Math.cos(simTime * 2.1 + cs.phase) * 5;
        const renderX = Math.min(vw - 70, Math.max(8, cs.x + driftX));
        const renderY = Math.min(vh - 45, Math.max(8, cs.y + driftY));
        cur.style.transform = `translate3d(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px, 0)`;
      }
    }

    function typeElementText(el) {
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
        const t = setTimeout(typeTick, Math.max(14, Math.round(44 / speedMultiplier)));
        replayTimers.push(t);
      };
      typeTick();
    }

    function computeDynamicAgents(layers, currentIdx) {
      const vh = window.innerHeight;
      let unbuiltVisible = 0;
      const end = Math.min(layers.length, currentIdx + 40);
      for (let i = currentIdx; i < end; i++) {
        const r = layers[i].el.getBoundingClientRect();
        if (r.bottom >= 0 && r.top <= vh + 80) unbuiltVisible++;
      }
      // Fluctuate dynamically between 14 and 18 based on unbuilt density in current viewport
      if (unbuiltVisible <= 6) return 14;
      if (unbuiltVisible <= 11) return 15;
      if (unbuiltVisible <= 17) return 16;
      if (unbuiltVisible <= 24) return 17;
      return 18;
    }

    function startReplay() {
      if (isReplaying) stopReplay(false);
      isReplaying = true;
      clearTimers();

      // Disable CSS scroll-smooth so per-frame Touring scroll scales identically at 1x, 2x, and 3x
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollFloatY = 0;
      targetScrollY = 0;

      const layers = collectLayers();
      const total = layers.length;
      activeAgentsCount = computeDynamicAgents(layers, 0);

      // Step 1: BLANK CANVAS — hide all layers completely!
      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer', 'swarm-wireframe-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      statusText.textContent = `${activeAgentsCount} agents • 0/${total}`;

      let activeRect = null;
      let nextIdx = 0;
      let wireIdx = 0;
      let finishing = false;
      let finishTimer = 0;
      let simTime = 0;
      let currentScrollSpeed = 38;
      lastTs = 0;
      cursorAccum = 0;
      stepAccum = 0;

      cursorStates.forEach((cs, idx) => pickCursorTarget(cs, idx, null));

      // Slightly calmer 1x pacing while scaling proportionally at 2x & 3x
      function getStepIntervalSec(item) {
        return item.mode === 'text' ? 0.145 : 0.105;
      }

      function tick(ts) {
        if (!isReplaying) return;
        if (!lastTs) lastTs = ts;
        const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
        lastTs = ts;

        const dt = rawDt * speedMultiplier;
        simTime += dt;
        cursorAccum += dt;
        stepAccum += dt;

        // Re-target a few cursors toward the active element periodically, while moving all 60fps
        if (cursorAccum >= 0.45) {
          cursorAccum = 0;
          for (let i = 0; i < 4; i++) {
            const idx = Math.floor(Math.random() * Math.min(6, activeAgentsCount));
            pickCursorTarget(cursorStates[idx], idx, activeRect);
          }
        }
        updateCursorsContinuous(dt, simTime, activeRect);

        // Continuous Adaptive Touring Scroll (never stops completely; slows in dense areas, speeds up after)
        if (touringEnabled) {
          const vh = window.innerHeight;
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
          if (scrollFloatY < maxScroll) {
            let unbuiltBehindOrHere = 0;
            const checkEnd = Math.min(total, nextIdx + 28);
            for (let i = nextIdx; i < checkEnd; i++) {
              const r = layers[i].el.getBoundingClientRect();
              if (r.top < vh * 0.62) unbuiltBehindOrHere++;
            }
            const nextTop = nextIdx < total ? layers[nextIdx].el.getBoundingClientRect().top : vh;

            let desiredSpeed = 78; // normal cruising speed
            if (finishing || nextTop > vh * 0.68) {
              desiredSpeed = 170; // current area done -> glide faster to next section
            } else if (unbuiltBehindOrHere >= 8 || nextTop < vh * 0.32) {
              desiredSpeed = 34; // dense/unfinished area -> slow down gently, never stop
            }

            currentScrollSpeed += (desiredSpeed - currentScrollSpeed) * Math.min(1, 3.5 * rawDt);
            scrollFloatY = Math.min(maxScroll, scrollFloatY + currentScrollSpeed * dt);
            window.scrollTo({ top: scrollFloatY, behavior: 'instant' });
          }
        }

        // Phase A: Sketch wireframe slightly ahead of build
        while (wireIdx < total && wireIdx <= nextIdx + 2) {
          const wItem = layers[wireIdx];
          if (wItem.el.classList.contains('swarm-blank-layer')) {
            wItem.el.classList.remove('swarm-blank-layer');
            wItem.el.classList.add('swarm-wireframe-layer');
            playWireframeSound();
          }
          wireIdx++;
        }

        // Phase B: Build next layer(s) on schedule
        while (nextIdx < total) {
          const item = layers[nextIdx];
          const needed = getStepIntervalSec(item);
          if (stepAccum < needed) break;
          stepAccum -= needed;

          const rect = item.el.getBoundingClientRect();
          activeRect = rect;
          activeAgentsCount = computeDynamicAgents(layers, nextIdx);

          statusText.textContent = `${activeAgentsCount} agents • ${nextIdx + 1}/${total}`;

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

          item.el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
          item.el.classList.add('swarm-built-layer');

          if (item.mode === 'text') {
            typeElementText(item.el);
          } else {
            playSnapSound();
          }

          nextIdx++;
        }

        if (nextIdx >= total) {
          // Keep tick running briefly so Touring scroll finishes smoothly to the bottom at 1x/2x/3x
          if (!finishing) {
            finishing = true;
            finishTimer = 0;
          }
          finishTimer += dt;
          if (finishTimer >= 0.55) {
            stopReplay(true, total);
            return;
          }
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
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
      if (touringEnabled) {
        scrollFloatY = window.scrollY;
        targetScrollY = window.scrollY;
      }
    });

    speedBtn.addEventListener('click', () => {
      speedMultiplier = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 3 : 1;
      speedBtn.textContent = `${speedMultiplier}x`;
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
