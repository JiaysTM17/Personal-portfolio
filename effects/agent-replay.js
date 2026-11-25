// Swarm Rebuild — Authentic Multi-Agent UI/UX Build Replay
// 1. Orbital "Scanning page..." intro with 18 clean agent pointers
// 2. Comprehensive section-by-section parallel build (zero elements skipped)
// 3. Smooth Touring auto-scroll that waits for each section to finish building
// 4. Live dynamic 1x / 2x / 3x speed switching without restarting or losing cursors
// 5. Web Audio API UI sound effects & Victory circle regroup

(function () {
  const AGENT_COUNT = 18;
  const AGENT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6'
  ];

  // Collect every visible section and its constituent leaf/card elements so nothing is left out
  const SECTION_GROUPS = [
    {
      name: 'Header',
      root: 'header',
      items: [
        { sel: 'header a.group', type: 'box' },
        { sel: 'header nav a', type: 'text' },
        { sel: 'header #zen-mode-btn', type: 'box' },
        { sel: 'header a[href="#contact"]', type: 'box' },
        { sel: 'header a[href*="github.com"]', type: 'box' }
      ]
    },
    {
      name: 'Hero',
      root: '#hero',
      items: [
        { sel: '#hero .font-display.font-black.tracking-tighter', type: 'box' },
        { sel: '#hero .inline-flex.rounded-full', type: 'box' },
        { sel: '#hero .font-handwriting', type: 'text' },
        { sel: '#hero h1', type: 'text' },
        { sel: '#hero h2', type: 'text' },
        { sel: '#hero p.text-gray-300', type: 'text' },
        { sel: '#hero img[alt*="Trương Gia Kiệt"]', type: 'box' },
        { sel: '#hero a[href="#works"]', type: 'box' },
        { sel: '#hero a[href*="github.com"]', type: 'box' },
        { sel: '#hero .flex.flex-wrap.items-center.gap-5', type: 'box' },
        { sel: '#hero .md\\:col-span-2 > a', type: 'box' }
      ]
    },
    {
      name: 'Engineering Hub',
      root: 'section.bg-\\[\\#0b0c10\\]',
      items: [
        { sel: 'section.bg-\\[\\#0b0c10\\] .text-center span', type: 'text' },
        { sel: 'section.bg-\\[\\#0b0c10\\] h2', type: 'text' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .text-center p', type: 'text' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6 h3', type: 'text' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6 p', type: 'box' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .grid-cols-2 > a', type: 'box' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7 span.rounded-lg', type: 'box' },
        { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5', type: 'box' }
      ]
    },
    {
      name: 'Selected Works',
      root: '#works',
      items: [
        { sel: '#works .font-mono.uppercase', type: 'text' },
        { sel: '#works h2', type: 'text' },
        { sel: '#works .md\\:items-end p', type: 'box' },
        { sel: '#works a[href*="repositories"]', type: 'box' },
        { sel: '#project-filters button', type: 'box' },
        { sel: '#projects-grid .project-card', type: 'box' }
      ]
    },
    {
      name: 'Technical Focus',
      root: '#services',
      items: [
        { sel: '#services h2', type: 'text' },
        { sel: '#services .text-6xl', type: 'box' },
        { sel: '#services .lg\\:col-span-5 p', type: 'box' },
        { sel: '#services .accordion-item', type: 'box' }
      ]
    },
    {
      name: 'Architecture Docs',
      root: '#docs',
      items: [
        { sel: '#docs h2', type: 'text' },
        { sel: '#docs .space-y-4 > div', type: 'box' }
      ]
    },
    {
      name: 'About Me',
      root: '#about',
      items: [
        { sel: '#about h2', type: 'text' },
        { sel: '#about blockquote', type: 'text' },
        { sel: '#about .border-l', type: 'box' },
        { sel: '#about .grid-cols-2 > div', type: 'box' },
        { sel: '#about .lg\\:col-span-6 > div.bg-\\[\\#12141a\\]', type: 'box' }
      ]
    },
    {
      name: 'Journey & Resume',
      root: '#journey',
      items: [
        { sel: '#journey h2', type: 'text' },
        { sel: '#journey .space-y-6 > div', type: 'box' },
        { sel: '#journey .bg-\\[\\#f5f6f8\\]', type: 'box' }
      ]
    },
    {
      name: 'Contact & Footer',
      root: '#contact',
      items: [
        { sel: '#contact h2', type: 'text' },
        { sel: '#contact #copy-email-btn', type: 'box' },
        { sel: '#contact .grid-cols-2 > a', type: 'box' },
        { sel: '#contact-form', type: 'box' },
        { sel: 'footer', type: 'box' }
      ]
    }
  ];

  let isReplaying = false;
  let replayRunId = 0;
  let touringEnabled = true;
  let soundEnabled = false;
  let speedMultiplier = 1; // 1, 2, 3
  let audioCtx = null;
  let savedHTMLMap = new Map();
  let orbitAnimId = null;

  // Dynamic sleep that adapts LIVE when speedMultiplier changes (1x -> 2x -> 3x)
  function dynamicWait(baseMs, runId) {
    return new Promise(resolve => {
      let elapsed = 0;
      let last = performance.now();
      function step(now) {
        if (!isReplaying || runId !== replayRunId) {
          resolve(false);
          return;
        }
        const dt = now - last;
        last = now;
        elapsed += dt * speedMultiplier;
        if (elapsed >= baseMs) {
          resolve(true);
        } else {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Smooth scroll that takes ~650ms (scaled by speedMultiplier)
  function smoothScrollTo(targetY, runId) {
    return new Promise(resolve => {
      const startY = window.scrollY;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const destY = Math.min(maxScroll, Math.max(0, targetY));
      const diff = destY - startY;
      if (Math.abs(diff) < 12) {
        resolve(true);
        return;
      }
      let progress = 0;
      let last = performance.now();
      const baseDuration = 650;

      function frame(now) {
        if (!isReplaying || runId !== replayRunId) {
          resolve(false);
          return;
        }
        const dt = now - last;
        last = now;
        progress += (dt * speedMultiplier) / baseDuration;
        const t = Math.min(1, progress);
        // easeInOutCubic
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, startY + diff * ease);
        if (t >= 1) {
          resolve(true);
        } else {
          requestAnimationFrame(frame);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  // Web Audio API Synthesizer
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

  function playDragSound() { playTone(460 + Math.random() * 140, 0.04, 0.018, 'triangle'); }
  function playTypeSound() { playTone(820 + Math.random() * 180, 0.02, 0.012, 'square'); }
  function playSnapSound() { playTone(340 + Math.random() * 160, 0.05, 0.022, 'sine'); }
  function playCompleteChime() {
    if (!soundEnabled) return;
    setTimeout(() => playTone(523.25, 0.14, 0.04, 'sine'), 0);
    setTimeout(() => playTone(659.25, 0.14, 0.04, 'sine'), 100);
    setTimeout(() => playTone(783.99, 0.25, 0.05, 'sine'), 200);
  }

  function createPointerSVG(color) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 1.5L13.5 7.5L8.2 9.1L5.8 14.2L2.5 1.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.15" stroke-linejoin="round"/>
    </svg>`;
  }

  function buildSectionPlan() {
    const seen = new Set();
    const sections = [];
    let totalLayers = 0;

    SECTION_GROUPS.forEach(group => {
      const rootEl = document.querySelector(group.root);
      if (!rootEl) return;
      const items = [];
      group.items.forEach(spec => {
        document.querySelectorAll(spec.sel).forEach(el => {
          if (!seen.has(el)) {
            seen.add(el);
            const hasComplex = el.querySelectorAll('div, svg, img, span').length > 0;
            const mode = (spec.type === 'text' && !hasComplex) ? 'text' : 'box';
            items.push({ el, mode });
            totalLayers++;
          }
        });
      });
      if (items.length > 0) {
        sections.push({ name: group.name, rootEl, items });
      }
    });

    return { sections, totalLayers };
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

    overlay.appendChild(guideH);
    overlay.appendChild(guideV);

    // 18 Clean Agent Cursors
    const cursors = [];
    for (let i = 0; i < AGENT_COUNT; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const cur = document.createElement('div');
      cur.className = 'agent-cursor';
      cur.style.opacity = '0';
      cur.innerHTML = createPointerSVG(color);
      overlay.appendChild(cur);
      cursors.push({
        el: cur,
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5
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
      <span id="replay-status-text" class="text-gray-200 whitespace-nowrap font-semibold">18 agents</span>
      <button id="replay-tour-btn" type="button" title="Tự động cuộn chậm theo tiến trình thiết kế" class="px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors">Touring</button>
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

    function setCursorPos(cursorObj, x, y, durationMs = 280) {
      cursorObj.x = x;
      cursorObj.y = y;
      cursorObj.el.style.transition = `transform ${Math.max(80, Math.round(durationMs / speedMultiplier))}ms cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease`;
      cursorObj.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.innerHTML = html;
      });
      savedHTMLMap.clear();
    }

    function cleanupActiveDragBoxes() {
      overlay.querySelectorAll('.agent-drag-box').forEach(b => b.remove());
    }

    function stopReplay(completed = false, totalLayers = 0, durationSec = 0) {
      isReplaying = false;
      replayRunId++;
      if (orbitAnimId) {
        cancelAnimationFrame(orbitAnimId);
        orbitAnimId = null;
      }

      restoreAllSavedText();
      cleanupActiveDragBoxes();

      document.querySelectorAll('.swarm-blank-layer, .swarm-clip-revealing').forEach(el => {
        el.classList.remove('swarm-blank-layer', 'swarm-clip-revealing');
        el.classList.add('swarm-built-layer');
        el.style.clipPath = '';
        el.style.transition = '';
      });

      guideH.style.opacity = '0';
      guideV.style.opacity = '0';
      cursors.forEach(c => (c.el.style.opacity = '0'));
      overlay.style.display = 'none';

      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');

      if (completed) {
        playCompleteChime();
        statusText.textContent = `Rebuilt by 18 agents in ${durationSec.toFixed(1)}s`;
      } else {
        statusText.textContent = `18 agents • Live`;
      }
    }

    // Phase 0: Orbital "Scanning page..." ring rotation (like Image 1!)
    function runOrbitalIntro(runId, baseDurationMs) {
      return new Promise(resolve => {
        statusText.textContent = 'Scanning page...';
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.45;
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.14;
        let angleOffset = 0;
        let elapsed = 0;
        let last = performance.now();

        cursors.forEach(c => {
          c.el.style.transition = 'opacity 0.25s ease';
          c.el.style.opacity = '1';
        });

        function orbitFrame(now) {
          if (!isReplaying || runId !== replayRunId) {
            resolve(false);
            return;
          }
          const dt = now - last;
          last = now;
          elapsed += dt * speedMultiplier;
          angleOffset += (dt * speedMultiplier) * 0.0042;

          cursors.forEach((c, i) => {
            const a = angleOffset + (i / AGENT_COUNT) * Math.PI * 2;
            const px = cx + Math.cos(a) * radius;
            const py = cy + Math.sin(a) * (radius * 0.85);
            c.x = px;
            c.y = py;
            c.el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
          });

          if (elapsed >= baseDurationMs) {
            resolve(true);
          } else {
            orbitAnimId = requestAnimationFrame(orbitFrame);
          }
        }
        orbitAnimId = requestAnimationFrame(orbitFrame);
      });
    }

    // Victory Regroup circle at end of build
    async function runVictoryRegroup(runId) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.5;
      const radius = 90;
      cursors.forEach((c, i) => {
        const a = (i / AGENT_COUNT) * Math.PI * 2;
        setCursorPos(c, cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, 450);
      });
      await dynamicWait(550, runId);
    }

    // Typewriter animation with I-beam caret
    async function animateTypeText(el, cursorObj, runId) {
      if (!savedHTMLMap.has(el)) {
        savedHTMLMap.set(el, el.innerHTML);
      }
      const fullText = el.textContent.trim();
      if (!fullText) return;

      el.textContent = '';
      el.classList.remove('swarm-blank-layer');
      el.classList.add('swarm-built-layer', 'swarm-typing-caret');

      const steps = Math.min(16, Math.max(5, Math.ceil(fullText.length / 3)));
      const charsPerStep = Math.ceil(fullText.length / steps);

      for (let s = 1; s <= steps; s++) {
        if (!isReplaying || runId !== replayRunId) return;
        const sliceLen = Math.min(fullText.length, s * charsPerStep);
        el.textContent = fullText.slice(0, sliceLen);

        // Move agent cursor smoothly along the typing end
        const r = el.getBoundingClientRect();
        const progressRatio = sliceLen / fullText.length;
        setCursorPos(cursorObj, r.left + Math.min(r.width, r.width * progressRatio + 10), r.top + r.height * 0.65, 90);
        playTypeSound();

        const ok = await dynamicWait(42, runId);
        if (!ok) return;
      }

      el.classList.remove('swarm-typing-caret');
      if (savedHTMLMap.has(el)) {
        el.innerHTML = savedHTMLMap.get(el);
        savedHTMLMap.delete(el);
      }
    }

    // Drag wireframe box from 0x0 -> WxH, then reveal element!
    async function buildSingleLayer(item, cursorIdx, runId) {
      if (!isReplaying || runId !== replayRunId) return;

      const el = item.el;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        el.classList.remove('swarm-blank-layer');
        el.classList.add('swarm-built-layer');
        return;
      }

      const cursorObj = cursors[cursorIdx % AGENT_COUNT];

      // 1. Agent moves to top-left corner of element
      setCursorPos(cursorObj, rect.left, rect.top, 220);
      const dragBox = document.createElement('div');
      dragBox.className = 'agent-drag-box';
      dragBox.style.left = `${rect.left}px`;
      dragBox.style.top = `${rect.top}px`;
      dragBox.style.width = '12px';
      dragBox.style.height = '12px';
      dragBox.innerHTML = `
        <span class="agent-drag-handle tl"></span>
        <span class="agent-drag-handle tr"></span>
        <span class="agent-drag-handle bl"></span>
        <span class="agent-drag-handle br"></span>
        <span class="agent-drag-dim">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>
        <span class="agent-drag-crosshair">+</span>
      `;
      overlay.appendChild(dragBox);

      // Snap alignment guides briefly
      guideH.style.opacity = '1';
      guideH.style.top = `${rect.top}px`;
      guideV.style.opacity = '1';
      guideV.style.left = `${rect.left}px`;

      playDragSound();
      if (!(await dynamicWait(110, runId))) { dragBox.remove(); return; }

      // 2. Drag wireframe out to full W x H with '+' crosshair & cursor at bottom-right
      dragBox.style.transition = `width ${Math.max(90, Math.round(240 / speedMultiplier))}ms ease-out, height ${Math.max(90, Math.round(240 / speedMultiplier))}ms ease-out`;
      dragBox.style.width = `${rect.width}px`;
      dragBox.style.height = `${rect.height}px`;
      setCursorPos(cursorObj, rect.right, rect.bottom, 240);

      if (item.mode === 'box') {
        // Real clip-path crop/draw reveal synchronized with the agent dragging the frame!
        el.classList.remove('swarm-blank-layer');
        el.classList.add('swarm-clip-revealing');
        el.style.transition = `clip-path ${Math.max(120, Math.round(280 / speedMultiplier))}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        requestAnimationFrame(() => {
          el.style.clipPath = 'inset(0 0 0 0)';
        });
      }

      if (!(await dynamicWait(260, runId))) { dragBox.remove(); return; }

      // 3. Build actual element (Type text or finalize clip-reveal)
      if (item.mode === 'text') {
        await animateTypeText(el, cursorObj, runId);
      } else {
        el.classList.remove('swarm-clip-revealing');
        el.classList.add('swarm-built-layer');
        el.style.clipPath = '';
        el.style.transition = '';
        playSnapSound();
        if (!(await dynamicWait(100, runId))) { dragBox.remove(); return; }
      }

      dragBox.remove();
    }

    async function startReplay() {
      if (isReplaying) stopReplay(false);
      isReplaying = true;
      const runId = ++replayRunId;
      const startTime = performance.now();

      window.scrollTo(0, 0);

      const { sections, totalLayers } = buildSectionPlan();
      let builtCount = 0;

      // Blank out ENTIRE page
      sections.forEach(sec => {
        sec.items.forEach(item => {
          item.el.classList.remove('swarm-built-layer');
          item.el.classList.add('swarm-blank-layer');
        });
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');

      // Phase 0: Orbital "Scanning page..." for ~1.9 seconds (1x)
      if (!(await runOrbitalIntro(runId, 1900))) return;

      // Phase 1: Section-by-Section Deliberate Build + Smooth Touring Scroll
      let cursorPointer = 0;

      for (const sec of sections) {
        if (!isReplaying || runId !== replayRunId) return;

        // Smooth Touring Scroll to center the current section BEFORE building it
        if (touringEnabled) {
          const secRect = sec.rootEl.getBoundingClientRect();
          const targetScrollY = Math.max(0, window.scrollY + secRect.top - 90);
          if (!(await smoothScrollTo(targetScrollY, runId))) return;
          if (!(await dynamicWait(160, runId))) return;
        }

        // Build elements in this section in parallel batches of 4-5 agents (organized, not chaotic!)
        const batchSize = 4;
        for (let i = 0; i < sec.items.length; i += batchSize) {
          if (!isReplaying || runId !== replayRunId) return;
          const batch = sec.items.slice(i, i + batchSize);

          // Also keep Touring comfortably aligned if a tall section extends below viewport
          if (touringEnabled) {
            const firstRect = batch[0].el.getBoundingClientRect();
            if (firstRect.top > window.innerHeight * 0.72) {
              const adjY = window.scrollY + firstRect.top - window.innerHeight * 0.3;
              if (!(await smoothScrollTo(adjY, runId))) return;
            }
          }

          await Promise.all(
            batch.map((item, offset) => {
              const cIdx = (cursorPointer + offset) % AGENT_COUNT;
              return buildSingleLayer(item, cIdx, runId).then(() => {
                if (isReplaying && runId === replayRunId) {
                  builtCount++;
                  statusText.textContent = `18 agents • ${builtCount}/${totalLayers} layers`;
                }
              });
            })
          );

          cursorPointer = (cursorPointer + batchSize) % AGENT_COUNT;
          if (!(await dynamicWait(80, runId))) return;
        }
      }

      // Phase 2: Victory Regroup & Complete!
      if (!isReplaying || runId !== replayRunId) return;
      await runVictoryRegroup(runId);

      const elapsedSec = (performance.now() - startTime) / 1000;
      stopReplay(true, totalLayers, elapsedSec);
    }

    // Interactive Controls
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

    // Live Speed Switching: 1x -> 2x -> 3x WITHOUT restarting or losing cursors!
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

    // Auto-start on page load
    setTimeout(() => {
      startReplay();
    }, 250);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
