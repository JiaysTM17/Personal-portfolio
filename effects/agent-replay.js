(() => {
  'use strict';

  const MAX_AGENTS = 10;
  const INTRO_DURATION = 1.2; // seconds at 1x
  const OUTRO_DURATION = 0.85;
  const TOUR_SCROLL_SPEED = 85; // px/s at 1x

  const AGENT_PROFILES = [
    { name: 'Layout', color: '#3b82f6' },
    { name: 'Type', color: '#a855f7' },
    { name: 'Grid', color: '#06b6d4' },
    { name: 'Assets', color: '#ec4899' },
    { name: 'Spacing', color: '#f59e0b' },
    { name: 'Tokens', color: '#10b981' },
    { name: 'Cards', color: '#6366f1' },
    { name: 'Align', color: '#f97316' },
    { name: 'Motion', color: '#14b8a6' },
    { name: 'UI', color: '#e11d48' },
  ];

  const LAYER_SELECTORS = [
    'header a',
    'header button',
    'header span.rounded-full',
    '#hero span.rounded-full',
    '#hero p',
    '#hero h1',
    '#hero h2',
    '#hero a',
    '#hero img',
    '#hero .hero-stat',
    'section.bg-\\[\\#0b0c10\\] h3',
    'section.bg-\\[\\#0b0c10\\] p',
    'section.bg-\\[\\#0b0c10\\] span.rounded-full',
    'section.bg-\\[\\#0b0c10\\] a',
    '#works h2',
    '#works > div > div > p',
    '#project-filters button',
    '#projects-grid .project-card img',
    '#projects-grid .project-card h3',
    '#projects-grid .project-card p',
    '#projects-grid .project-card span',
    '#projects-grid .project-card a',
    '#services h2',
    '#services > div > div > p',
    '#services .service-card h3',
    '#services .service-card p',
    '#services .service-card li',
    '#services .service-card span',
    '#docs h2',
    '#docs > div > div > p',
    '#docs .doc-card span',
    '#docs .doc-card h3',
    '#docs .doc-card p',
    '#docs .doc-card button',
    '#docs .doc-card a',
    '#about h2',
    '#about p',
    '#about img',
    '#about .stat-box',
    '#journey h2',
    '#journey .timeline-item h3',
    '#journey .timeline-item p',
    '#journey .timeline-item span',
    '#contact h2',
    '#contact p',
    '#contact a',
    '#contact input',
    '#contact textarea',
    '#contact button',
    'footer a',
    'footer p',
    'footer span',
    'main section h2',
    'main section h3',
    'main section p',
    'main section img',
    'main section a',
    'main section button',
  ];

  let isReplaying = false;
  let phase = 'idle'; // 'intro' | 'build' | 'outro'
  let rafId = null;
  let lastTs = 0;
  let simTime = 0;
  let phaseTimer = 0;
  let speedMultiplier = 1;
  let tourEnabled = true;
  let isMuted = true;
  let scrollFloatY = 0;

  let overlayEl = null;
  let dockEl = null;
  let miniPillEl = null;
  let audioCtx = null;
  let lastPopTs = 0;
  let lastKeyTs = 0;

  let layers = [];
  let agents = [];
  let builtCount = 0;
  let heroMaxY = 720;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function createCursorSvg(color) {
    return `
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 3.5L19.5 11.2L12.6 13.4L10.4 20.3L5.5 3.5Z"
              fill="${color}" stroke="#09090b" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function ensureAudio() {
    if (isMuted) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playKeyTick() {
    if (isMuted) return;
    const nowMs = performance.now();
    if (nowMs - lastKeyTs < 65) return;
    lastKeyTs = nowMs;

    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(760 + Math.random() * 240, now);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  function playSnapPop(freqBase = 480) {
    if (isMuted) return;
    const nowMs = performance.now();
    if (nowMs - lastPopTs < 60) return;
    lastPopTs = nowMs;

    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const f = freqBase + (Math.random() * 160 - 60);
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * 1.32, now + 0.045);

    gain.gain.setValueAtTime(0.032, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  function playDoneChord() {
    if (isMuted) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const now = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.038, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.34);
    });
  }

  function collectLayers() {
    const seen = new Set();
    const raw = [];
    const scrollY = window.scrollY || 0;

    LAYER_SELECTORS.forEach((sel) => {
      let els = [];
      try {
        els = document.querySelectorAll(sel);
      } catch (_) {
        return;
      }
      els.forEach((el) => {
        if (seen.has(el)) return;
        if (el.closest('#agent-replay-overlay') || el.closest('#agent-replay-dock')) return;
        if (el.closest('.fixed')) return;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

        const rect = el.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return;
        if (rect.width > window.innerWidth * 0.98 && rect.height > window.innerHeight * 0.95) return;

        seen.add(el);
        const absTop = rect.top + scrollY;
        const absLeft = rect.left + (window.scrollX || 0);
        const text = (el.innerText || '').trim();
        const isText = el.children.length === 0 && text.length > 0 && el.tagName !== 'IMG';

        raw.push({
          el,
          absTop,
          absLeft,
          width: rect.width,
          height: rect.height,
          isText,
          textLen: text.length,
          claimed: false,
          built: false,
        });
      });
    });

    // Deduplicate elements with nearly identical bounding boxes
    const filtered = [];
    for (let i = 0; i < raw.length; i++) {
      const a = raw[i];
      let dup = false;
      for (let j = 0; j < filtered.length; j++) {
        const b = filtered[j];
        if (
          Math.abs(a.absTop - b.absTop) < 4 &&
          Math.abs(a.absLeft - b.absLeft) < 4 &&
          Math.abs(a.width - b.width) < 10 &&
          Math.abs(a.height - b.height) < 10
        ) {
          dup = true;
          break;
        }
      }
      if (!dup) filtered.push(a);
    }

    filtered.sort((a, b) => {
      if (Math.abs(a.absTop - b.absTop) > 12) return a.absTop - b.absTop;
      return a.absLeft - b.absLeft;
    });

    return filtered;
  }

  function showMiniPill() {
    if (!miniPillEl) {
      miniPillEl = document.createElement('button');
      miniPillEl.type = 'button';
      miniPillEl.className =
        'fixed bottom-5 right-5 z-[100] flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-900/90 border border-blue-500/40 text-xs font-mono text-zinc-200 shadow-xl backdrop-blur-md hover:border-blue-400 transition cursor-pointer';
      miniPillEl.innerHTML =
        '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Swarm Replay</span>';
      miniPillEl.addEventListener('click', () => {
        if (miniPillEl) miniPillEl.style.display = 'none';
        startSwarmReplay();
      });
      document.body.appendChild(miniPillEl);
    }
    miniPillEl.style.display = 'flex';
  }

  function createOverlay() {
    if (overlayEl) overlayEl.remove();
    overlayEl = document.createElement('div');
    overlayEl.id = 'agent-replay-overlay';
    document.body.appendChild(overlayEl);
  }

  function createDock() {
    if (dockEl) dockEl.remove();
    dockEl = document.createElement('div');
    dockEl.id = 'agent-replay-dock';
    dockEl.innerHTML = `
      <div class="dock-hide-mobile flex items-center gap-1 mr-1">
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span class="w-2 h-2 rounded-full bg-purple-500"></span>
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
      </div>
      <span id="swarm-dock-status" class="text-zinc-200 whitespace-nowrap">Clearing canvas...</span>
      <button id="swarm-tour-btn" type="button" class="px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
        tourEnabled ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
      }">Tour</button>
      <button id="swarm-speed-btn" type="button" class="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition cursor-pointer">${speedMultiplier}x</button>
      <button id="swarm-mute-btn" type="button" class="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition cursor-pointer" title="Toggle Sound">${
        isMuted ? '🔇' : '🔊'
      }</button>
      <button id="swarm-action-btn" type="button" class="px-3 py-0.5 rounded-full font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition cursor-pointer">Go Live</button>
      <button id="swarm-close-btn" type="button" class="px-1.5 py-0.5 text-zinc-400 hover:text-white transition cursor-pointer" title="Minimize">✕</button>
    `;
    document.body.appendChild(dockEl);

    dockEl.querySelector('#swarm-tour-btn').addEventListener('click', () => {
      tourEnabled = !tourEnabled;
      const btn = dockEl.querySelector('#swarm-tour-btn');
      btn.className = `px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
        tourEnabled ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
      }`;
      if (tourEnabled) scrollFloatY = window.scrollY;
    });

    dockEl.querySelector('#swarm-speed-btn').addEventListener('click', () => {
      speedMultiplier = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 3 : 1;
      dockEl.querySelector('#swarm-speed-btn').textContent = `${speedMultiplier}x`;
    });

    dockEl.querySelector('#swarm-mute-btn').addEventListener('click', () => {
      isMuted = !isMuted;
      dockEl.querySelector('#swarm-mute-btn').textContent = isMuted ? '🔇' : '🔊';
      if (!isMuted) ensureAudio();
    });

    dockEl.querySelector('#swarm-action-btn').addEventListener('click', () => {
      if (isReplaying) {
        finishReplay(true);
      } else {
        startSwarmReplay();
      }
    });

    dockEl.querySelector('#swarm-close-btn').addEventListener('click', () => {
      if (isReplaying) finishReplay(true);
      if (dockEl) dockEl.style.display = 'none';
      showMiniPill();
    });
  }

  function createAgentPool() {
    agents = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let i = 0; i < MAX_AGENTS; i++) {
      const profile = AGENT_PROFILES[i % AGENT_PROFILES.length];
      const el = document.createElement('div');
      el.className = 'agent-cursor';
      el.innerHTML = `
        ${createCursorSvg(profile.color)}
        <span class="agent-cursor-label" style="background:${profile.color}">${profile.name}</span>
      `;
      el.style.opacity = '1';
      overlayEl.appendChild(el);

      agents.push({
        id: i,
        profile,
        el,
        x: vw * 0.5,
        y: vh * 0.45,
        angle: 0,
        visible: true,
        state: 'idle', // 'idle' | 'travel' | 'work'
        task: null,
        workTime: 0,
        workDur: 0.48,
        dragBox: null,
        dragDim: null,
        guideH: null,
        guideV: null,
        caret: null,
        lastSoundTick: 0,
      });
    }
  }

  function cleanupAgentArtifacts(a) {
    if (a.dragBox) {
      a.dragBox.remove();
      a.dragBox = null;
      a.dragDim = null;
    }
    if (a.guideH) {
      a.guideH.remove();
      a.guideH = null;
    }
    if (a.guideV) {
      a.guideV.remove();
      a.guideV = null;
    }
    if (a.caret) {
      a.caret.remove();
      a.caret = null;
    }
  }

  function spawnWireframe(a, rect) {
    cleanupAgentArtifacts(a);

    const box = document.createElement('div');
    box.className = 'agent-drag-box';
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = '0px';
    box.style.height = '0px';

    box.innerHTML = `
      <span class="agent-drag-handle tl"></span>
      <span class="agent-drag-handle tr"></span>
      <span class="agent-drag-handle bl"></span>
      <span class="agent-drag-handle br"></span>
      <span class="agent-drag-crosshair">+</span>
      <span class="agent-drag-dim">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>
    `;

    overlayEl.appendChild(box);
    a.dragBox = box;
    a.dragDim = box.querySelector('.agent-drag-dim');

    // Alignment guides for medium/large blocks so it looks like real UI layout alignment
    if (rect.width > 110 || rect.height > 60) {
      const gh = document.createElement('div');
      gh.className = 'agent-guide-h';
      gh.style.top = `${rect.top}px`;
      overlayEl.appendChild(gh);
      a.guideH = gh;

      const gv = document.createElement('div');
      gv.className = 'agent-guide-v';
      gv.style.left = `${rect.left}px`;
      overlayEl.appendChild(gv);
      a.guideV = gv;
    }

    if (a.task && a.task.isText) {
      const caret = document.createElement('span');
      caret.className = 'swarm-typing-caret';
      caret.style.left = `${rect.left + 2}px`;
      caret.style.top = `${rect.top + 2}px`;
      overlayEl.appendChild(caret);
      a.caret = caret;
    }
  }

  function updateAgentElement(a) {
    a.el.style.opacity = a.visible ? '1' : '0';
    if (a.visible) {
      a.el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) rotate(${a.angle.toFixed(1)}deg)`;
    }
  }

  function updateIntroPhase() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw * 0.5;
    const cy = vh * 0.45;
    const p = clamp(simTime / INTRO_DURATION, 0, 1);

    for (let i = 0; i < MAX_AGENTS; i++) {
      const a = agents[i];
      const stream = i % 2 === 0 ? -1 : 1;
      const idxInStream = Math.floor(i / 2);
      const t = simTime * 2.8 - idxInStream * 0.22;

      const nx = cx + stream * (70 + p * 140) + Math.cos(t * 1.4) * 55;
      const ny = cy + Math.sin(t * 1.6 + stream * 0.8) * 85;

      const vx = nx - a.x;
      const vy = ny - a.y;
      if (Math.hypot(vx, vy) > 0.3) {
        a.angle = clamp((Math.atan2(vy, vx) * 180) / Math.PI + 90, -25, 25);
      }
      a.x = nx;
      a.y = ny;
      a.visible = true;
      updateAgentElement(a);
    }

    const statusEl = dockEl && dockEl.querySelector('#swarm-dock-status');
    if (statusEl) statusEl.textContent = 'Clearing canvas & planning layout...';
  }

  function findNextTaskForAgent(a) {
    const vh = window.innerHeight;
    let best = null;
    let bestScore = Infinity;

    for (let i = 0; i < layers.length; i++) {
      const l = layers[i];
      if (l.claimed || l.built) continue;
      const rect = l.el.getBoundingClientRect();
      if (rect.bottom < -60 || rect.top > vh + 160) continue;

      const dist = Math.hypot(rect.left - a.x, rect.top - a.y);
      const topBias = Math.max(0, rect.top) * 1.1;
      const score = topBias + dist * 0.45;
      if (score < bestScore) {
        bestScore = score;
        best = l;
      }
    }
    return best;
  }

  function updateBuildPhase(dt) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let heroUnbuilt = 0;
    for (let i = 0; i < layers.length; i++) {
      if (!layers[i].built && layers[i].absTop < heroMaxY) {
        heroUnbuilt++;
      }
    }

    let activeCount = 0;

    for (let i = 0; i < MAX_AGENTS; i++) {
      const a = agents[i];

      if (a.task) {
        activeCount++;
        const rect = a.task.el.getBoundingClientRect();

        if (a.state === 'travel') {
          const tx = clamp(rect.left + 4, 8, vw - 24);
          const ty = clamp(rect.top + 4, 8, vh - 24);
          const dx = tx - a.x;
          const dy = ty - a.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 12) {
            a.x = tx;
            a.y = ty;
            a.angle = 0;
            a.state = 'work';
            a.workTime = 0;
            a.lastSoundTick = 0;
            const areaFactor = Math.min(0.2, (rect.width * rect.height) / 360000);
            a.workDur = a.task.isText
              ? clamp(0.42 + a.task.textLen * 0.0055, 0.45, 0.72)
              : clamp(0.4 + areaFactor, 0.42, 0.64);
            spawnWireframe(a, rect);
          } else {
            const step = Math.min(dist, 920 * dt);
            a.x += (dx / dist) * step;
            a.y += (dy / dist) * step;
            a.angle = clamp((dx / dist) * 12, -14, 14);
          }
          a.visible = true;
          updateAgentElement(a);
        } else if (a.state === 'work') {
          a.workTime += dt;
          const p = clamp(a.workTime / a.workDur, 0, 1);
          const e = 1 - Math.pow(1 - p, 2.2);

          const curW = rect.width * e;
          const curH = rect.height * e;

          if (a.dragBox) {
            a.dragBox.style.left = `${rect.left}px`;
            a.dragBox.style.top = `${rect.top}px`;
            a.dragBox.style.width = `${curW}px`;
            a.dragBox.style.height = `${curH}px`;
            if (a.dragDim) {
              a.dragDim.textContent = `${Math.round(curW)} × ${Math.round(curH)}`;
            }
          }
          if (a.guideH) a.guideH.style.top = `${rect.top}px`;
          if (a.guideV) a.guideV.style.left = `${rect.left}px`;

          if (a.task.isText) {
            // Progressive typing reveal via clip-path + moving I-beam caret
            a.task.el.classList.remove('swarm-blank-layer');
            a.task.el.classList.add('swarm-typing-layer');
            const pctRight = Math.max(0, 100 - e * 100);
            a.task.el.style.clipPath = `inset(0 ${pctRight.toFixed(1)}% 0 0)`;

            if (a.caret) {
              a.caret.style.left = `${rect.left + Math.min(rect.width - 2, curW)}px`;
              a.caret.style.top = `${rect.top + Math.min(rect.height - 14, 4)}px`;
            }

            if (p - a.lastSoundTick > 0.22) {
              a.lastSoundTick = p;
              playKeyTick();
            }
          } else if (p > 0.72 && a.task.el.classList.contains('swarm-blank-layer')) {
            a.task.el.classList.remove('swarm-blank-layer');
            a.task.el.classList.add('swarm-built-layer');
          }

          a.x = clamp(rect.left + curW, 8, vw - 20);
          a.y = clamp(rect.top + curH, 8, vh - 20);
          a.angle = -6;
          a.visible = true;
          updateAgentElement(a);

          if (p >= 1) {
            a.task.el.classList.remove('swarm-blank-layer', 'swarm-typing-layer');
            a.task.el.style.clipPath = '';
            a.task.el.classList.add('swarm-built-layer');
            a.task.built = true;
            builtCount++;
            cleanupAgentArtifacts(a);
            playSnapPop(460 + (builtCount % 6) * 45);
            a.task = null;
            a.state = 'idle';
          }
        }
      } else {
        const nextTask = findNextTaskForAgent(a);
        if (nextTask) {
          nextTask.claimed = true;
          a.task = nextTask;
          a.state = 'travel';
          a.visible = true;
          activeCount++;
          updateAgentElement(a);
        } else {
          // No available task in current viewport -> hide cursor cleanly
          a.visible = false;
          updateAgentElement(a);
        }
      }
    }

    // Continuous smooth Tour auto-scroll once Hero settles
    const heroDone = heroUnbuilt === 0 || simTime > 3.8;
    if (tourEnabled && heroDone) {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (scrollFloatY < maxScroll) {
        scrollFloatY = Math.min(maxScroll, scrollFloatY + TOUR_SCROLL_SPEED * dt);
        window.scrollTo({ top: scrollFloatY, behavior: 'instant' });
      }
    }

    const statusEl = dockEl && dockEl.querySelector('#swarm-dock-status');
    if (statusEl) {
      statusEl.textContent = `${activeCount || MAX_AGENTS} designers • ${builtCount}/${layers.length} layers`;
    }

    if (builtCount >= layers.length) {
      phase = 'outro';
      phaseTimer = 0;
      playDoneChord();
    }
  }

  function updateOutroPhase(dt) {
    phaseTimer += dt;
    const p = clamp(phaseTimer / OUTRO_DURATION, 0, 1);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (let i = 0; i < MAX_AGENTS; i++) {
      const a = agents[i];
      cleanupAgentArtifacts(a);
      const ang = simTime * 2.8 + (i / MAX_AGENTS) * Math.PI * 2;
      const rad = 80 + p * 130;
      a.x = vw * 0.5 + Math.cos(ang) * rad;
      a.y = vh * 0.5 + Math.sin(ang) * rad * 0.6;
      a.angle = 0;
      a.el.style.opacity = `${(1 - p).toFixed(2)}`;
      a.el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
    }

    if (p >= 1) {
      finishReplay(false);
    }
  }

  function tick(ts) {
    if (!isReplaying) return;
    if (!lastTs) lastTs = ts;
    const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    const dt = rawDt * speedMultiplier;
    simTime += dt;

    if (phase === 'intro') {
      updateIntroPhase();
      if (simTime >= INTRO_DURATION) {
        phase = 'build';
      }
    } else if (phase === 'build') {
      updateBuildPhase(dt);
    } else if (phase === 'outro') {
      updateOutroPhase(dt);
    }

    if (isReplaying) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function finishReplay(interrupted) {
    isReplaying = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    document.documentElement.style.scrollBehavior = '';

    layers.forEach((l) => {
      l.el.classList.remove('swarm-blank-layer', 'swarm-typing-layer');
      l.el.style.clipPath = '';
      l.el.classList.add('swarm-built-layer');
    });

    agents.forEach((a) => cleanupAgentArtifacts(a));
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }

    if (dockEl) {
      const statusEl = dockEl.querySelector('#swarm-dock-status');
      const actionBtn = dockEl.querySelector('#swarm-action-btn');
      if (statusEl) {
        statusEl.textContent = interrupted
          ? `Live • ${layers.length} layers`
          : `Rebuilt by ${MAX_AGENTS} designers in ${simTime.toFixed(1)}s`;
      }
      if (actionBtn) {
        actionBtn.textContent = 'Replay';
      }
    }
  }

  function startSwarmReplay() {
    if (isReplaying) finishReplay(true);

    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrollFloatY = 0;

    layers = collectLayers();
    builtCount = 0;
    heroMaxY = Math.max(680, window.innerHeight * 0.92);

    layers.forEach((l) => {
      l.el.classList.remove('swarm-built-layer', 'swarm-typing-layer');
      l.el.style.clipPath = '';
      l.el.classList.add('swarm-blank-layer');
    });

    if (miniPillEl) miniPillEl.style.display = 'none';

    createOverlay();
    createDock();
    createAgentPool();

    simTime = 0;
    phaseTimer = 0;
    lastTs = 0;
    phase = 'intro';
    isReplaying = true;

    rafId = requestAnimationFrame(tick);
  }

  window.startSwarmReplay = startSwarmReplay;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      startSwarmReplay();
    }, 250);
  });
})();
