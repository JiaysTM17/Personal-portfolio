// Swarm Rebuild — Parallel Multi-Agent UI/UX Build Replay
// Every visible cursor (14–18 dynamic) owns a real layer task, sketches its own wireframe bbox,
// types text with I-beam carets, hides when idle, waits for 85% Hero completion before Touring,
// and adapts scroll speed directly to agent completion progress.

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
    { sel: 'main section h4, main section li, main section svg, main section img, main section span, main section a, main section button, main section p', label: 'UILayer', type: 'box' }
  ];

  let isReplaying = false;
  let touringEnabled = true;
  let soundEnabled = false;
  let speedMultiplier = 1; // 1x -> 2x -> 3x
  let rafId = null;
  let lastTs = 0;
  let scrollFloatY = 0;

  let replayTimers = [];
  let audioCtx = null;
  let savedHTMLMap = new Map();
  let lastWireSound = 0;
  let lastTypeSound = 0;
  let lastSnapSound = 0;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playTone(freq, duration, vol = 0.025, type = 'sine') {
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

  function playWireframeSound() {
    const now = performance.now();
    if (now - lastWireSound < 70) return;
    lastWireSound = now;
    playTone(520 + Math.random() * 140, 0.04, 0.016, 'triangle');
  }

  function playTypeSound() {
    const now = performance.now();
    if (now - lastTypeSound < 65) return;
    lastTypeSound = now;
    playTone(780 + Math.random() * 200, 0.025, 0.013, 'square');
  }

  function playSnapSound() {
    const now = performance.now();
    if (now - lastSnapSound < 60) return;
    lastSnapSound = now;
    playTone(380 + Math.random() * 180, 0.045, 0.02, 'sine');
  }

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
        const isImg = el.tagName === 'IMG' || el.querySelector('img') !== null;
        const text = (el.innerText || '').trim();
        list.push({
          el,
          absTop: rect.top + scrollY,
          absLeft: rect.left + (window.scrollX || 0),
          label: idx > 0 ? `${item.label}_${idx + 1}` : item.label,
          mode,
          isImg,
          fullText: text,
          textLen: text.length,
          claimed: false,
          built: false
        });
      });
    });

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

    // Pool of 18 parallel agents, each with its own cursor + wireframe bbox
    const agents = [];
    for (let i = 0; i < MAX_AGENTS; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.opacity = '0';
      cur.innerHTML = `
        ${createPointerSVG(color)}
        <div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i % AGENT_NAMES.length]}</div>
      `;
      overlay.appendChild(cur);

      const bbox = document.createElement('div');
      bbox.className = 'agent-bbox';
      bbox.style.opacity = '0';
      bbox.style.borderColor = color;
      bbox.innerHTML = `
        <span class="agent-bbox-handle tl" style="border-color:${color}"></span>
        <span class="agent-bbox-handle tr" style="border-color:${color}"></span>
        <span class="agent-bbox-handle bl" style="border-color:${color}"></span>
        <span class="agent-bbox-handle br" style="border-color:${color}"></span>
        <span class="agent-bbox-dim" style="background:${color}">0 × 0</span>
      `;
      overlay.appendChild(bbox);

      agents.push({
        id: i,
        color,
        cur,
        bbox,
        dimEl: bbox.querySelector('.agent-bbox-dim'),
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.4,
        state: 'idle', // 'idle' | 'travel' | 'work'
        task: null,
        workTime: 0,
        workDur: 0.45
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
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">14 agents</span>
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

    function hideAgent(a) {
      a.cur.style.opacity = '0';
      a.bbox.style.opacity = '0';
      a.task = null;
      a.state = 'idle';
    }

    function stopReplay(completed = false, totalCount = 0, finalActive = 14) {
      isReplaying = false;
      clearTimers();
      restoreAllSavedText();
      document.documentElement.style.scrollBehavior = '';

      document.querySelectorAll('.swarm-blank-layer, .swarm-wireframe-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
        el.style.clipPath = '';
        el.style.opacity = '';
        el.classList.add('swarm-built-layer');
      });
      document.querySelectorAll('.swarm-built-layer').forEach(el => {
        el.style.clipPath = '';
        el.style.opacity = '';
      });

      agents.forEach(hideAgent);
      overlay.style.display = 'none';

      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');

      if (completed) {
        playCompleteSound();
        statusText.textContent = `${finalActive} agents • ${totalCount}/${totalCount} layers`;
      } else {
        statusText.textContent = `${finalActive} agents • Live`;
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
      const stepChars = Math.max(1, Math.ceil(fullText.length / 8));
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
        const t = setTimeout(typeTick, Math.max(14, Math.round(45 / speedMultiplier)));
        replayTimers.push(t);
      };
      typeTick();
    }

    function findNextTask(layers, agent) {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Preferred screen zone per agent so 14-18 cursors spread across the whole viewport
      const zoneX = (((agent.id % 6) + 0.5) / 6) * vw;
      const zoneY = 80 + ((Math.floor(agent.id / 6) + 0.5) / 3) * Math.max(200, vh - 140);

      let best = null;
      let bestScore = Infinity;

      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        if (l.claimed || l.built) continue;
        const r = l.el.getBoundingClientRect();
        // Strictly inside visible viewport (never claim off-screen bottom edge!)
        if (r.bottom < 10 || r.top > vh - 36) continue;

        const zoneDist = Math.hypot(r.left - zoneX, r.top - zoneY);
        const agentDist = Math.hypot(r.left - agent.x, r.top - agent.y);
        const score = zoneDist * 0.72 + agentDist * 0.28;
        if (score < bestScore) {
          bestScore = score;
          best = l;
        }
      }
      return best;
    }

    function startReplay() {
      if (isReplaying) stopReplay(false);
      isReplaying = true;
      clearTimers();

      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, behavior: 'instant' });
      scrollFloatY = 0;

      const layers = collectLayers();
      const total = layers.length;
      const heroCutoffY = Math.max(660, window.innerHeight * 0.92);

      // Count Hero layers so we wait for 85% of Hero to finish before starting Touring scroll
      let heroTotal = 0;
      layers.forEach(item => {
        if (item.absTop < heroCutoffY) heroTotal++;
        item.el.classList.remove('swarm-built-layer', 'swarm-wireframe-layer');
        item.el.style.clipPath = '';
        item.el.style.opacity = '';
        item.el.classList.add('swarm-blank-layer');
      });

      agents.forEach((a, idx) => {
        a.state = 'idle';
        a.task = null;
        a.x = window.innerWidth * (0.15 + (idx / MAX_AGENTS) * 0.7);
        a.y = window.innerHeight * (0.25 + (idx % 3) * 0.18);
        a.cur.style.opacity = '0';
        a.bbox.style.opacity = '0';
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
      statusText.textContent = `14 agents • 0/${total}`;

      let builtCount = 0;
      let heroBuilt = 0;
      let peakOrCurrentActive = 14;
      let currentScrollSpeed = 0;
      let introTime = 0;
      const INTRO_DUR = 1.6; // 1-2s thinking/planning phase on blank canvas
      lastTs = 0;

      function tick(ts) {
        if (!isReplaying) return;
        if (!lastTs) lastTs = ts;
        const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
        lastTs = ts;

        const dt = rawDt * speedMultiplier;
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        // Phase 0: 1.6s Blank-Canvas "Thinking" Intro with 14 active cursors weaving smoothly
        if (introTime < INTRO_DUR) {
          introTime += dt;
          statusText.textContent = `14 agents • Planning...`;
          for (let i = 0; i < MAX_AGENTS; i++) {
            const a = agents[i];
            if (i >= MIN_AGENTS) {
              a.cur.style.opacity = '0';
              continue;
            }
            const stream = i % 2 === 0 ? -1 : 1;
            const idxInStream = Math.floor(i / 2);
            const t = introTime * 2.7 - idxInStream * 0.22;
            const nx = vw * 0.5 + stream * (95 + 75 * Math.sin(t * 0.9)) + Math.cos(t * 1.6) * 48;
            const ny = vh * 0.46 + Math.sin(t * 1.4 + stream * 0.8) * 95 + Math.cos(t * 0.7) * 26;
            a.x = clamp(nx, 20, vw - 60);
            a.y = clamp(ny, 20, vh - 40);
            a.cur.style.opacity = '1';
            a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
          }
          rafId = requestAnimationFrame(tick);
          return;
        }

        // Count unclaimed & unfinished layers in/near current viewport
        let unbuiltVisible = 0;
        let unclaimedVisible = 0;
        let leadTop = Infinity;

        for (let i = 0; i < total; i++) {
          const l = layers[i];
          if (l.built) continue;
          const r = l.el.getBoundingClientRect();
          if (r.top < leadTop && r.bottom >= 10) leadTop = r.top;
          if (r.bottom >= 10 && r.top <= vh - 36) {
            unbuiltVisible++;
            if (!l.claimed) unclaimedVisible++;
          }
        }

        // Dynamic target agent cap (14–18) based on visible density
        let targetCap = MIN_AGENTS;
        if (unbuiltVisible > 24) targetCap = 18;
        else if (unbuiltVisible > 17) targetCap = 17;
        else if (unbuiltVisible > 11) targetCap = 16;
        else if (unbuiltVisible > 6) targetCap = 15;
        else targetCap = 14;

        let workingCount = 0;
        for (let i = 0; i < MAX_AGENTS; i++) {
          if (agents[i].task !== null) workingCount++;
        }

        // Update every agent: 100% of visible agents own a real task; idle ones stay hidden
        for (let i = 0; i < MAX_AGENTS; i++) {
          const a = agents[i];

          if (a.task) {
            const rect = a.task.el.getBoundingClientRect();

            if (a.state === 'travel') {
              const tx = clamp(rect.left + 4, 8, vw - 40);
              const ty = clamp(rect.top + 4, 8, vh - 30);
              const dx = tx - a.x;
              const dy = ty - a.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 14) {
                a.x = tx;
                a.y = ty;
                a.state = 'work';
                a.workTime = 0;
                a.lastCharCount = 0;
                a.workDur = a.task.mode === 'text'
                  ? clamp(0.45 + a.task.textLen * 0.005, 0.48, 0.78)
                  : clamp(0.38 + Math.min(0.22, (rect.width * rect.height) / 360000), 0.40, 0.68);

                a.task.el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer');
                a.task.el.classList.add('swarm-built-layer');

                if (a.task.mode === 'text' && a.task.fullText) {
                  if (!savedHTMLMap.has(a.task.el)) {
                    savedHTMLMap.set(a.task.el, a.task.el.innerHTML);
                  }
                  a.task.el.textContent = '';
                  a.task.el.classList.add('swarm-typing-caret');
                } else {
                  a.task.el.style.clipPath = 'inset(0 100% 100% 0)';
                  playWireframeSound();
                }
              } else {
                // Fast approach when far, smooth brake when close
                const speed = dist > 90 ? Math.max(1100, dist * 8.5) : Math.max(260, dist * 6.5);
                const step = Math.min(dist, speed * dt);
                a.x += (dx / dist) * step;
                a.y += (dy / dist) * step;
              }

              a.cur.style.opacity = '1';
              a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
              a.bbox.style.opacity = '0';
            } else if (a.state === 'work') {
              a.workTime += dt;
              const p = clamp(a.workTime / a.workDur, 0, 1);
              const e = 1 - Math.pow(1 - p, 2.2);

              const curW = Math.max(6, rect.width * e);
              const curH = Math.max(6, rect.height * e);

              a.bbox.style.opacity = '1';
              a.bbox.style.left = `${rect.left}px`;
              a.bbox.style.top = `${rect.top}px`;
              a.bbox.style.width = `${curW}px`;
              a.bbox.style.height = `${curH}px`;
              a.dimEl.textContent = `${Math.round(curW)} × ${Math.round(curH)}`;

              // Live progressive reveal DURING work (typing text / wiping images / stretching frames)
              if (a.task.mode === 'text' && a.task.fullText) {
                const chars = Math.max(1, Math.ceil(a.task.fullText.length * p));
                if (chars > a.lastCharCount) {
                  a.lastCharCount = chars;
                  a.task.el.textContent = a.task.fullText.slice(0, chars);
                  if (chars % 3 === 0) playTypeSound();
                }
              } else if (a.task.isImg) {
                const bottomInset = Math.max(0, 100 - e * 100).toFixed(1);
                a.task.el.style.clipPath = `inset(0 0 ${bottomInset}% 0)`;
                a.task.el.style.opacity = `${(0.25 + 0.75 * e).toFixed(2)}`;
              } else {
                const insetPct = Math.max(0, 100 - e * 100).toFixed(1);
                a.task.el.style.clipPath = `inset(0 ${insetPct}% ${insetPct}% 0)`;
              }

              a.x = clamp(rect.left + curW, 8, vw - 40);
              a.y = clamp(rect.top + curH, 8, vh - 30);
              a.cur.style.opacity = '1';
              a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;

              if (p >= 1) {
                a.task.el.classList.remove('swarm-blank-layer', 'swarm-wireframe-layer', 'swarm-typing-caret');
                a.task.el.style.clipPath = '';
                a.task.el.style.opacity = '';
                if (savedHTMLMap.has(a.task.el)) {
                  a.task.el.innerHTML = savedHTMLMap.get(a.task.el);
                  savedHTMLMap.delete(a.task.el);
                }
                a.task.el.classList.add('swarm-built-layer');
                a.task.built = true;
                builtCount++;
                if (a.task.absTop < heroCutoffY) heroBuilt++;

                if (a.task.mode !== 'text') playSnapSound();

                a.bbox.style.opacity = '0';
                a.task = null;
                a.state = 'idle';
                workingCount--;
              }
            }
          } else {
            // Claim a new layer if under targetCap and an unclaimed visible layer exists
            if (workingCount < targetCap && unclaimedVisible > 0) {
              const nextTask = findNextTask(layers, a);
              if (nextTask) {
                nextTask.claimed = true;
                unclaimedVisible--;
                a.task = nextTask;
                a.state = 'travel';
                workingCount++;
                if (a.cur.style.opacity === '0') {
                  // Enter briskly near the target or edge instead of crawling from a corner
                  const r = nextTask.el.getBoundingClientRect();
                  a.x = clamp(r.left + (Math.random() > 0.5 ? 90 : -90), 16, vw - 40);
                  a.y = clamp(r.top + (Math.random() > 0.5 ? 40 : -40), 16, vh - 30);
                }
                a.cur.style.opacity = '1';
                a.cur.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
                continue;
              }
            }
            // No task -> hide cursor completely so zero idle cursors appear on screen
            a.cur.style.opacity = '0';
            a.bbox.style.opacity = '0';
          }
        }

        peakOrCurrentActive = workingCount > 0 ? clamp(workingCount, 1, MAX_AGENTS) : peakOrCurrentActive;
        statusText.textContent = `${workingCount} agents • ${builtCount}/${total}`;

        // Touring Auto-Scroll: wait until 85% of Hero is built, then wave fast-transition -> slow-build
        const heroReady = heroTotal === 0 || (heroBuilt / heroTotal) >= 0.85;
        if (touringEnabled && heroReady) {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
          if (scrollFloatY < maxScroll) {
            let desiredSpeed = 60;
            let accelRate = 7.0;

            if (builtCount >= total) {
              desiredSpeed = 620;
              accelRate = 12.0;
            } else if (unbuiltVisible <= 4 || leadTop > vh * 0.40) {
              // Screen nearly done OR unbuilt layers only sit in lower half -> dash fast to fill ENTIRE screen!
              desiredSpeed = 680;
              accelRate = 16.0;
            } else if (unbuiltVisible >= 8 && leadTop <= vh * 0.24) {
              // Unbuilt layers fill the whole screen top-to-bottom -> creep ultra-slowly so agents spread evenly
              desiredSpeed = 10;
              accelRate = 9.0;
            } else {
              desiredSpeed = 48;
              accelRate = 7.0;
            }

            currentScrollSpeed += (desiredSpeed - currentScrollSpeed) * Math.min(1, accelRate * rawDt);
            scrollFloatY = Math.min(maxScroll, scrollFloatY + currentScrollSpeed * dt);
            window.scrollTo({ top: scrollFloatY, behavior: 'instant' });
          }
        }

        if (builtCount >= total) {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
          if (!touringEnabled || scrollFloatY >= maxScroll - 4) {
            stopReplay(true, total, peakOrCurrentActive);
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
        stopReplay(false, 0, 14);
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
      if (isReplaying) stopReplay(false, 0, 14);
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

    setTimeout(() => {
      startReplay();
    }, 300);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
