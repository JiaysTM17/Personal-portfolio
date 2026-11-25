// Multi-Agent Build Replay Effect (Figma / AI Swarm Overlay)
// Recreates the live multi-agent cursor swarm, selection bounding boxes, and layer build replay.

(function () {
  const AGENT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#f43f5e', '#6366f1'
  ];

  const AGENT_NAMES = [
    'Layout-AI', 'UI-Core', 'Type-Bot', 'Grid-Sys',
    'Style-V3', 'Hero-Bot', 'Card-AI', 'Nav-Bot',
    'Motion-1', 'Bento-AI', 'DOM-Sync', 'Pixel-QA',
    'Rim-FX', 'Flex-Bot', 'Meta-AI', 'Deploy-1'
  ];

  const TARGET_SELECTORS = [
    { sel: 'header nav', label: 'Navbar' },
    { sel: '#hero h1', label: 'HeroHeading' },
    { sel: '#hero h2', label: 'RoleTag' },
    { sel: '#hero img[alt*="Trương Gia Kiệt"]', label: 'PortraitCutout' },
    { sel: '#hero a[href="#works"]', label: 'PrimaryCTA' },
    { sel: '#hero a[href*="github.com"]', label: 'GitHubCTA' },
    { sel: '#hero .md\\:col-span-2', label: 'HeroMetrics' },
    { sel: '#studio-clock-time', label: 'StudioClock' },
    { sel: '.project-card[data-id="utecoffe"]', label: 'ProjectCard_01' },
    { sel: '.project-card[data-id="nexora"]', label: 'ProjectCard_02' },
    { sel: '.project-card[data-id="fullstack-ecommerce"]', label: 'ProjectCard_03' }
  ];

  let isReplaying = false;
  let speedMultiplier = 1;
  let replayTimers = [];
  let cursorLoopId = null;

  function createPointerSVG(color) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 1.5L13.5 7.5L8.2 9.1L5.8 14.2L2.5 1.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`;
  }

  function initReplayUI() {
    // 1. Overlay container
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

    // Create 14 multiplayer cursors
    const cursors = [];
    for (let i = 0; i < 14; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.opacity = '0';
      cur.style.transform = `translate3d(${window.innerWidth * 0.5}px, ${window.innerHeight * 0.5}px, 0)`;
      cur.innerHTML = `
        ${createPointerSVG(color)}
        <div class="agent-cursor-label" style="background:${color};">${AGENT_NAMES[i % AGENT_NAMES.length]}</div>
      `;
      overlay.appendChild(cur);
      cursors.push(cur);
    }

    document.body.appendChild(overlay);

    // 2. Floating Dock
    const dock = document.createElement('div');
    dock.id = 'agent-replay-dock';
    dock.innerHTML = `
      <div class="flex -space-x-1.5 dock-hide-mobile">
        <span class="w-4 h-4 rounded-full bg-blue-500 border border-[#0f1119]"></span>
        <span class="w-4 h-4 rounded-full bg-purple-500 border border-[#0f1119]"></span>
        <span class="w-4 h-4 rounded-full bg-pink-500 border border-[#0f1119]"></span>
        <span class="w-4 h-4 rounded-full bg-amber-500 border border-[#0f1119]"></span>
        <span class="w-4 h-4 rounded-full bg-emerald-500 border border-[#0f1119]"></span>
      </div>
      <span id="replay-status-text" class="text-gray-300 whitespace-nowrap">14 agents • Ready</span>
      <button id="replay-speed-btn" type="button" class="px-2 py-0.5 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-300 border border-[#2d364d] transition-colors dock-hide-mobile">1x</button>
      <button id="replay-action-btn" type="button" class="px-3 py-1 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors whitespace-nowrap">Replay Build</button>
      <button id="replay-minimize-btn" type="button" title="Ẩn thanh điều khiển" class="text-gray-400 hover:text-white px-1 transition-colors">×</button>
    `;
    document.body.appendChild(dock);

    // Mini restore pill (when minimized)
    const miniPill = document.createElement('button');
    miniPill.id = 'agent-replay-mini';
    miniPill.type = 'button';
    miniPill.className = 'fixed bottom-5 left-5 z-[95] hidden items-center gap-1.5 bg-[#12141a]/90 backdrop-blur-md border border-brand-500/40 hover:border-brand-400 text-brand-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-lg transition-all';
    miniPill.innerHTML = '<span>✦</span><span>Replay Build</span>';
    document.body.appendChild(miniPill);

    const statusText = document.getElementById('replay-status-text');
    const speedBtn = document.getElementById('replay-speed-btn');
    const actionBtn = document.getElementById('replay-action-btn');
    const minimizeBtn = document.getElementById('replay-minimize-btn');
    const bboxTag = document.getElementById('bbox-tag');
    const bboxDim = document.getElementById('bbox-dim');

    function clearAllTimers() {
      replayTimers.forEach(t => clearTimeout(t));
      replayTimers = [];
      if (cursorLoopId) {
        clearInterval(cursorLoopId);
        cursorLoopId = null;
      }
    }

    function stopReplay(completed = false) {
      isReplaying = false;
      clearAllTimers();

      // Reveal all elements immediately
      document.querySelectorAll('.replay-hidden-layer').forEach(el => {
        el.classList.remove('replay-hidden-layer');
        el.classList.add('replay-revealed-layer');
      });

      overlay.style.display = 'none';
      bbox.style.opacity = '0';
      guideH.style.opacity = '0';
      guideV.style.opacity = '0';
      cursors.forEach(c => (c.style.opacity = '0'));

      actionBtn.textContent = 'Replay Build';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');
      statusText.textContent = completed ? '14 agents • Rebuilt in 4.2s' : '14 agents • Live Mode';
    }

    function moveCursorsAround(rect) {
      cursors.forEach((cur, idx) => {
        cur.style.opacity = '1';
        if (rect && idx < 5) {
          // Focus 5 cursors near the active bounding box
          const rx = rect.left + Math.random() * Math.max(40, rect.width);
          const ry = rect.top + Math.random() * Math.max(30, rect.height);
          cur.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        } else {
          // Swarm the rest across viewport
          const rx = 40 + Math.random() * (window.innerWidth - 120);
          const ry = 60 + Math.random() * (window.innerHeight - 140);
          cur.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        }
      });
    }

    function startReplay(scrollToTop = false) {
      if (isReplaying) return;
      if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      isReplaying = true;
      clearAllTimers();

      const targets = TARGET_SELECTORS.map(item => ({
        el: document.querySelector(item.sel),
        label: item.label
      })).filter(item => item.el !== null);

      // Hide targets briefly in wireframe state
      targets.forEach(t => {
        t.el.classList.remove('replay-revealed-layer');
        t.el.classList.add('replay-hidden-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');

      const stepMs = Math.round(360 / speedMultiplier);
      const total = targets.length;
      let currentRect = null;

      // Swarm cursor loop
      moveCursorsAround(null);
      cursorLoopId = setInterval(() => {
        if (isReplaying) moveCursorsAround(currentRect);
      }, Math.round(480 / speedMultiplier));

      targets.forEach((target, idx) => {
        const timer = setTimeout(() => {
          if (!isReplaying) return;
          const rect = target.el.getBoundingClientRect();
          currentRect = rect;

          // Update status counter
          statusText.textContent = `14 agents • ${idx + 1} / ${total} layers`;

          // Move bounding box & guides
          if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
            bbox.style.opacity = '1';
            bbox.style.left = `${rect.left}px`;
            bbox.style.top = `${rect.top}px`;
            bbox.style.width = `${rect.width}px`;
            bbox.style.height = `${rect.height}px`;
            bboxTag.textContent = target.label;
            bboxDim.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

            guideH.style.opacity = '1';
            guideH.style.top = `${rect.top}px`;
            guideV.style.opacity = '1';
            guideV.style.left = `${rect.left}px`;
          }

          // Reveal layer
          target.el.classList.remove('replay-hidden-layer');
          target.el.classList.add('replay-revealed-layer');

          moveCursorsAround(rect);

          if (idx === total - 1) {
            const finishTimer = setTimeout(() => stopReplay(true), stepMs + 250);
            replayTimers.push(finishTimer);
          }
        }, idx * stepMs);

        replayTimers.push(timer);
      });
    }

    actionBtn.addEventListener('click', () => {
      if (isReplaying) {
        stopReplay(false);
      } else {
        startReplay(true);
      }
    });

    speedBtn.addEventListener('click', () => {
      speedMultiplier = speedMultiplier === 1 ? 2 : 1;
      speedBtn.textContent = `${speedMultiplier}x`;
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
      startReplay(true);
    });

    // Auto-start snappy build replay on first load after 450ms
    setTimeout(() => {
      startReplay(false);
    }, 450);
  }

  document.addEventListener('DOMContentLoaded', initReplayUI);
})();
