// Swarm Rebuild — Silky Paper-Airplane Multi-Agent Build Replay
// Features:
// - Organic paper-airplane flocking cursors (velocity-aligned rotation, never rigid, never frozen)
// - Continuous silky-smooth Tour auto-scroll (no jerky section jumps)
// - Calm, readable 1x pacing with live 1x / 2x / 3x speed multiplier
// - Real wireframe drawing, I-beam text typing & Web Audio API SFX

(function () {
  const AGENT_COUNT = 16;
  const AGENT_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#f43f5e', '#6366f1'
  ];

  const LAYER_SELECTORS = [
    { sel: 'header a.group', type: 'box' },
    { sel: 'header nav a', type: 'text' },
    { sel: 'header #zen-mode-btn', type: 'box' },
    { sel: 'header a[href="#contact"]', type: 'box' },
    { sel: 'header a[href*="github.com"]', type: 'box' },
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
    { sel: '#hero .md\\:col-span-2 > a', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .text-center span', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] h2', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .text-center p', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6 h3', type: 'text' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-6 p', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .grid-cols-2 > a', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-7 span.rounded-lg', type: 'box' },
    { sel: 'section.bg-\\[\\#0b0c10\\] .lg\\:col-span-5', type: 'box' },
    { sel: '#works .font-mono.uppercase', type: 'text' },
    { sel: '#works h2', type: 'text' },
    { sel: '#works .md\\:items-end p', type: 'box' },
    { sel: '#works a[href*="repositories"]', type: 'box' },
    { sel: '#project-filters button', type: 'box' },
    { sel: '#projects-grid .project-card', type: 'box' },
    { sel: '#services h2', type: 'text' },
    { sel: '#services .text-6xl', type: 'box' },
    { sel: '#services .lg\\:col-span-5 p', type: 'box' },
    { sel: '#services .accordion-item', type: 'box' },
    { sel: '#docs h2', type: 'text' },
    { sel: '#docs .space-y-4 > div', type: 'box' },
    { sel: '#about h2', type: 'text' },
    { sel: '#about blockquote', type: 'text' },
    { sel: '#about .border-l', type: 'box' },
    { sel: '#about .grid-cols-2 > div', type: 'box' },
    { sel: '#about .lg\\:col-span-6 > div.bg-\\[\\#12141a\\]', type: 'box' },
    { sel: '#journey h2', type: 'text' },
    { sel: '#journey .space-y-6 > div', type: 'box' },
    { sel: '#journey .bg-\\[\\#f5f6f8\\]', type: 'box' },
    { sel: '#contact h2', type: 'text' },
    { sel: '#contact #copy-email-btn', type: 'box' },
    { sel: '#contact .grid-cols-2 > a', type: 'box' },
    { sel: '#contact-form', type: 'box' },
    { sel: 'footer', type: 'box' }
  ];

  let isReplaying = false;
  let replayRunId = 0;
  let touringEnabled = true;
  let soundEnabled = false;
  let speedMultiplier = 1; // 1, 2, 3
  let audioCtx = null;
  let savedHTMLMap = new Map();
  let rafId = null;

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playTone(freq, duration, vol = 0.02, type = 'sine') {
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

  function playDragSound() { playTone(460 + Math.random() * 120, 0.035, 0.015, 'triangle'); }
  function playTypeSound() { playTone(800 + Math.random() * 180, 0.02, 0.01, 'square'); }
  function playSnapSound() { playTone(340 + Math.random() * 140, 0.045, 0.018, 'sine'); }
  function playCompleteChime() {
    if (!soundEnabled) return;
    setTimeout(() => playTone(523.25, 0.14, 0.035, 'sine'), 0);
    setTimeout(() => playTone(659.25, 0.14, 0.035, 'sine'), 100);
    setTimeout(() => playTone(783.99, 0.25, 0.045, 'sine'), 200);
  }

  // Sleek pointer / paper-airplane arrow pointing UP-LEFT (-135deg default, rotated by velocity)
  function createPointerSVG(color) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.2L13.8 14.2L8 11.2L2.2 14.2L8 1.2Z" fill="${color}" stroke="#ffffff" stroke-width="1.1" stroke-linejoin="round"/>
    </svg>`;
  }

  function collectAllLayers() {
    const seen = new Set();
    const list = [];
    LAYER_SELECTORS.forEach(spec => {
      document.querySelectorAll(spec.sel).forEach(el => {
        if (!seen.has(el)) {
          seen.add(el);
          const hasComplex = el.querySelectorAll('div, svg, img, span').length > 0;
          const mode = (spec.type === 'text' && !hasComplex) ? 'text' : 'box';
          const rect = el.getBoundingClientRect();
          const docTop = rect.top + window.scrollY;
          list.push({
            el,
            mode,
            docTop,
            state: 'blank', // blank -> dragging -> built
            progress: 0,
            dragBox: null
          });
        }
      });
    });
    list.sort((a, b) => a.docTop - b.docTop);
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

    overlay.appendChild(guideH);
    overlay.appendChild(guideV);

    // 16 Paper-Airplane Flocking Agents
    const agents = [];
    for (let i = 0; i < AGENT_COUNT; i++) {
      const color = AGENT_COLORS[i % AGENT_COLORS.length];
      const el = document.createElement('div');
      el.className = 'agent-cursor';
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.25s ease'; // NO transform transition — physics loop drives 60fps!
      el.innerHTML = createPointerSVG(color);
      overlay.appendChild(el);

      agents.push({
        el,
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 140,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 140,
        vx: 0,
        vy: 0,
        angle: 0,
        phase: (i / AGENT_COUNT) * Math.PI * 2,
        freqX: 1.1 + (i % 3) * 0.35,
        freqY: 0.9 + (i % 4) * 0.28,
        task: null
      });
    }

    document.body.appendChild(overlay);

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
      <button id="replay-tour-btn" type="button" title="Tự động cuộn mượt mà theo tiến trình thiết kế" class="px-2.5 py-0.5 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/50 hover:bg-brand-600/50 transition-colors">Tour</button>
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

    function restoreAllSavedText() {
      savedHTMLMap.forEach((html, el) => {
        el.classList.remove('swarm-typing-caret');
        el.innerHTML = html;
      });
      savedHTMLMap.clear();
    }

    function cleanupDragBoxes() {
      overlay.querySelectorAll('.agent-drag-box').forEach(b => b.remove());
    }

    function stopReplay(completed = false, totalLayers = 0, durationSec = 0) {
      isReplaying = false;
      replayRunId++;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      restoreAllSavedText();
      cleanupDragBoxes();
      agents.forEach(a => {
        a.task = null;
        a.el.style.opacity = '0';
      });

      document.querySelectorAll('.swarm-blank-layer').forEach(el => {
        el.classList.remove('swarm-blank-layer');
        el.classList.add('swarm-built-layer');
      });

      guideH.style.opacity = '0';
      guideV.style.opacity = '0';
      overlay.style.display = 'none';

      actionBtn.textContent = 'Replay';
      actionBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      actionBtn.classList.add('bg-brand-600', 'hover:bg-brand-500');

      if (completed) {
        playCompleteChime();
        statusText.textContent = `Rebuilt by ${AGENT_COUNT} agents in ${durationSec.toFixed(1)}s`;
      } else {
        statusText.textContent = `${AGENT_COUNT} agents • Live`;
      }
    }

    // Physics helper: steer an agent smoothly toward (tx, ty) and orient like a paper airplane!
    function steerAgent(agent, tx, ty, dtSec, stiffness = 9.0) {
      const dx = tx - agent.x;
      const dy = ty - agent.y;
      agent.vx += (dx * stiffness - agent.vx * 5.2) * dtSec;
      agent.vy += (dy * stiffness - agent.vy * 5.2) * dtSec;
      agent.x += agent.vx * dtSec;
      agent.y += agent.vy * dtSec;

      const speed = Math.hypot(agent.vx, agent.vy);
      if (speed > 12) {
        // Point nose in direction of velocity (+90deg because SVG nose points UP)
        const targetAngle = Math.atan2(agent.vy, agent.vx) * (180 / Math.PI) + 90;
        // Shortest angular interpolation
        let diff = ((targetAngle - agent.angle + 540) % 360) - 180;
        agent.angle += diff * Math.min(1, dtSec * 12);
      }

      const cx = Math.min(window.innerWidth - 20, Math.max(4, agent.x));
      const cy = Math.min(window.innerHeight - 20, Math.max(4, agent.y));
      agent.el.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${agent.angle.toFixed(1)}deg)`;
    }

    function startReplay() {
      if (isReplaying) stopReplay(false);
      isReplaying = true;
      const runId = ++replayRunId;
      const startTime = performance.now();

      window.scrollTo(0, 0);

      const layers = collectAllLayers();
      const totalLayers = layers.length;
      let builtCount = 0;
      let nextLayerIdx = 0;

      // Blank out entire page cleanly
      layers.forEach(item => {
        item.el.classList.remove('swarm-built-layer');
        item.el.classList.add('swarm-blank-layer');
      });

      overlay.style.display = 'block';
      actionBtn.textContent = 'Go Live';
      actionBtn.classList.remove('bg-brand-600', 'hover:bg-brand-500');
      actionBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');

      // Reset agents to center
      const cx0 = window.innerWidth * 0.5;
      const cy0 = window.innerHeight * 0.45;
      agents.forEach(a => {
        a.x = cx0 + Math.cos(a.phase) * 90;
        a.y = cy0 + Math.sin(a.phase) * 70;
        a.vx = 0;
        a.vy = 0;
        a.task = null;
        a.el.style.opacity = '1';
      });

      let simTime = 0;
      let lastFrame = performance.now();
      let scrollFloatY = 0;
      const introDuration = 1.45; // Organic paper-airplane flocking intro (~1.45s at 1x)
      let outroStart = null;
      const outroDuration = 1.1;

      function tick(now) {
        if (!isReplaying || runId !== replayRunId) return;

        const rawDt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        const dt = rawDt * speedMultiplier;
        simTime += dt;

        // PHASE 0: Organic Paper-Airplane Flocking ("Scanning page...")
        if (simTime < introDuration) {
          statusText.textContent = 'Scanning page...';
          const cx = window.innerWidth * 0.5;
          const cy = window.innerHeight * 0.45;
          agents.forEach((a, i) => {
            // Smooth Lissajous / swirling figure-8 flock — NOT a stiff circle!
            const t = simTime * 2.4 + a.phase;
            const rx = 135 + Math.sin(t * 0.7 + i) * 45;
            const ry = 85 + Math.cos(t * 1.1) * 35;
            const tx = cx + Math.cos(t * a.freqX * 0.65) * rx;
            const ty = cy + Math.sin(t * a.freqY * 0.85) * ry;
            steerAgent(a, tx, ty, dt, 10);
          });
          rafId = requestAnimationFrame(tick);
          return;
        }

        // PHASE 1: Smooth Continuous Tour Scroll + Active Multi-Agent Construction
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        if (touringEnabled && nextLayerIdx < totalLayers && outroStart === null) {
          // Look ahead at the next unbuilt layer to pace scroll naturally
          const nextLayer = layers[nextLayerIdx];
          const nextRect = nextLayer.el.getBoundingClientRect();
          // Smoothly crawl down only when current top items are handled, keeping active build comfortably in view
          if (nextRect.top > window.innerHeight * 0.55 && scrollFloatY < maxScroll) {
            // Gentle cinematic scroll speed (~135px/s at 1x)
            scrollFloatY = Math.min(maxScroll, scrollFloatY + 135 * dt);
            window.scrollTo(0, scrollFloatY);
          } else if (nextRect.top < 60 && scrollFloatY > 0) {
            scrollFloatY = Math.max(0, scrollFloatY - 90 * dt);
            window.scrollTo(0, scrollFloatY);
          }
        }

        // Assign idle agents to next available layers (up to 6 active builders at once for clean, readable pace)
        let activeBuilders = agents.filter(a => a.task !== null).length;
        while (activeBuilders < 6 && nextLayerIdx < totalLayers) {
          const item = layers[nextLayerIdx];
          const rect = item.el.getBoundingClientRect();
          // If Tour is ON and item is way below viewport, wait for smooth scroll to bring it into view!
          if (touringEnabled && rect.top > window.innerHeight * 0.88 && scrollFloatY < maxScroll - 5) {
            break;
          }

          const idleAgent = agents.find(a => a.task === null);
          if (!idleAgent) break;

          nextLayerIdx++;
          activeBuilders++;

          // Prepare text if typing mode
          let fullText = '';
          if (item.mode === 'text') {
            if (!savedHTMLMap.has(item.el)) {
              savedHTMLMap.set(item.el, item.el.innerHTML);
            }
            fullText = item.el.textContent.trim();
            item.el.textContent = '';
            item.el.classList.remove('swarm-blank-layer');
            item.el.classList.add('swarm-built-layer', 'swarm-typing-caret');
          }

          // Create wireframe drag box
          const dragBox = document.createElement('div');
          dragBox.className = 'agent-drag-box';
          dragBox.style.left = `${rect.left}px`;
          dragBox.style.top = `${rect.top}px`;
          dragBox.style.width = '8px';
          dragBox.style.height = '8px';
          dragBox.innerHTML = `
            <span class="agent-drag-handle tl"></span>
            <span class="agent-drag-handle tr"></span>
            <span class="agent-drag-handle bl"></span>
            <span class="agent-drag-handle br"></span>
            <span class="agent-drag-dim">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>
            <span class="agent-drag-crosshair">+</span>
          `;
          overlay.appendChild(dragBox);

          guideH.style.opacity = '1';
          guideH.style.top = `${rect.top}px`;
          guideV.style.opacity = '1';
          guideV.style.left = `${rect.left}px`;

          playDragSound();

          idleAgent.task = {
            item,
            dragBox,
            fullText,
            lastTypedLen: 0,
            elapsed: 0,
            duration: item.mode === 'text' ? Math.max(0.65, Math.min(1.15, fullText.length * 0.032)) : 0.62
          };
        }

        // Update all agents (both builders AND idle paper-airplanes!)
        agents.forEach((a, idx) => {
          if (a.task) {
            const t = a.task;
            t.elapsed += dt;
            const p = Math.min(1, t.elapsed / t.duration);
            const rect = t.item.el.getBoundingClientRect();

            // Keep wireframe aligned with live scroll position
            const curW = Math.max(8, rect.width * Math.min(1, p * 1.45));
            const curH = Math.max(8, rect.height * Math.min(1, p * 1.45));
            t.dragBox.style.left = `${rect.left}px`;
            t.dragBox.style.top = `${rect.top}px`;
            t.dragBox.style.width = `${curW}px`;
            t.dragBox.style.height = `${curH}px`;

            if (t.item.mode === 'text') {
              const charCount = Math.floor(t.fullText.length * p);
              if (charCount > t.lastTypedLen) {
                t.lastTypedLen = charCount;
                t.item.el.textContent = t.fullText.slice(0, charCount);
                playTypeSound();
              }
              steerAgent(a, rect.left + rect.width * p + 6, rect.top + rect.height * 0.5, dt, 14);
            } else {
              // Reveal element smoothly at 65% of drag
              if (p > 0.65 && t.item.el.classList.contains('swarm-blank-layer')) {
                t.item.el.classList.remove('swarm-blank-layer');
                t.item.el.classList.add('swarm-built-layer');
                playSnapSound();
              }
              steerAgent(a, rect.left + curW, rect.top + curH, dt, 13);
            }

            if (p >= 1) {
              // Finalize element
              if (t.item.mode === 'text') {
                t.item.el.classList.remove('swarm-typing-caret');
                if (savedHTMLMap.has(t.item.el)) {
                  t.item.el.innerHTML = savedHTMLMap.get(t.item.el);
                  savedHTMLMap.delete(t.item.el);
                }
              } else {
                t.item.el.classList.remove('swarm-blank-layer');
                t.item.el.classList.add('swarm-built-layer');
              }
              t.dragBox.remove();
              a.task = null;
              builtCount++;
              statusText.textContent = `${AGENT_COUNT} agents • ${builtCount}/${totalLayers} layers`;
            }
          } else {
            // Idle agents NEVER freeze! They bank smoothly in gentle paper-airplane loops around the active area
            const cx = window.innerWidth * 0.5;
            const cy = window.innerHeight * 0.48;
            const t = simTime * 1.45 + a.phase;
            const tx = cx + Math.cos(t * a.freqX * 0.55 + idx) * (window.innerWidth * 0.34);
            const ty = cy + Math.sin(t * a.freqY * 0.7 + idx) * (window.innerHeight * 0.28);
            steerAgent(a, tx, ty, dt, 4.5);
          }
        });

        // Check completion -> Victory paper-airplane flock outro!
        if (builtCount >= totalLayers && outroStart === null) {
          outroStart = simTime;
          guideH.style.opacity = '0';
          guideV.style.opacity = '0';
        }

        if (outroStart !== null) {
          const outroElapsed = simTime - outroStart;
          const cx = window.innerWidth * 0.5;
          const cy = window.innerHeight * 0.5;
          agents.forEach((a, i) => {
            const t = simTime * 2.8 + a.phase;
            const tx = cx + Math.cos(t + i * 0.2) * 110;
            const ty = cy + Math.sin(t * 1.2) * 80;
            steerAgent(a, tx, ty, dt, 8);
          });
          if (outroElapsed >= outroDuration) {
            const elapsedSec = (now - startTime) / 1000;
            stopReplay(true, totalLayers, elapsedSec);
            return;
          }
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    }

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

    // Live 1x -> 2x -> 3x speed (instantaneous, zero reset, zero disappearing cursors!)
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

    setTimeout(() => {
      startReplay();
    }, 250);
  }

  document.addEventListener('DOMContentLoaded', initSwarmReplay);
})();
