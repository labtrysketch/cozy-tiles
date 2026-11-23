/* Cozy Tiles — play loop.
   Slide a tile into the gap. Only solvable shuffles are dealt.
   Scenes come from puzzles.js. */
(function () {
  "use strict";

  const PASTELS = ["#ffd0e0", "#c9f0ea", "#ffe3a8", "#d5e4ff", "#e4d9ff", "#ffd9c2", "#d4f1c8", "#cfefff"];
  const $ = (sel) => document.querySelector(sel);

  let GRID = 4;
  try {
    const saved = parseInt(localStorage.getItem("cozytiles-grid"), 10);
    if (saved === 3 || saved === 4) GRID = saved;
  } catch (e) { /* private mode */ }

  let showNumbers = false;
  try { showNumbers = localStorage.getItem("cozytiles-numbers") === "1"; } catch (e) { /* private mode */ }

  let current = null;
  let order = [];
  let tileEls = {};
  let moves = 0;
  let seconds = 0;
  let timer = 0;
  let gameActive = false;
  let playId = 0;
  let ignoreClick = false;

  function padGap() {
    const styles = getComputedStyle(document.documentElement);
    return {
      pad: parseFloat(styles.getPropertyValue("--board-pad")) || 10,
      gap: parseFloat(styles.getPropertyValue("--tile-gap")) || 6
    };
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === id);
    });
    window.scrollTo(0, 0);
  }

  function dayOfYear(date) {
    const today = date || new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today - start) / 86400000);
  }

  function todayPuzzle() {
    return PUZZLES[dayOfYear() % PUZZLES.length];
  }

  function cssUrl(path) {
    return 'url("' + String(path).replace(/"/g, "%22") + '")';
  }

  function initHome() {
    const art = todayPuzzle();
    const img = $("#featured-img");
    img.src = art.image;
    img.alt = art.title;
    $("#featured-title").textContent = art.title;
    $("#featured-place").textContent = art.place || "";
    $("#featured-caption").textContent = art.caption || "";
  }

  function sceneCard(art, todayId) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scene-card";

    const wrap = document.createElement("div");
    wrap.className = "scene-art";
    const img = document.createElement("img");
    img.src = art.image;
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = "scene-fallback";
      fallback.textContent = art.title;
      img.replaceWith(fallback);
    });
    wrap.appendChild(img);
    if (art.id === todayId) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "Tonight";
      wrap.appendChild(badge);
    }

    const title = document.createElement("h3");
    title.textContent = art.title;
    const place = document.createElement("p");
    place.textContent = art.place || "";
    btn.append(wrap, title, place);
    btn.addEventListener("click", () => startGame(art));
    return btn;
  }

  function renderSceneGrid(container, list) {
    const todayId = todayPuzzle().id;
    container.replaceChildren();
    list.forEach((art) => container.appendChild(sceneCard(art, todayId)));
  }

  function initGallery() {
    renderSceneGrid($("#gallery-grid"), PUZZLES);
    showScreen("screen-gallery");
  }

  function initMoods() {
    const list = $("#mood-list");
    list.replaceChildren();
    MOODS.forEach((mood) => {
      const count = PUZZLES.filter((puzzle) => puzzle.mood === mood.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mood-card";
      const icon = document.createElement("span");
      icon.className = "mood-icon";
      icon.innerHTML = mood.icon;
      const text = document.createElement("span");
      text.className = "mood-text";
      const title = document.createElement("h3");
      title.textContent = mood.title;
      const caption = document.createElement("p");
      caption.textContent = mood.caption;
      const meta = document.createElement("p");
      meta.className = "count";
      meta.textContent = count + (count === 1 ? " scene" : " scenes");
      text.append(title, caption, meta);
      btn.append(icon, text);
      btn.addEventListener("click", () => openMood(mood));
      list.appendChild(btn);
    });
    showScreen("screen-moods");
  }

  function openMood(mood) {
    $("#mood-title").textContent = mood.title;
    $("#mood-blurb").textContent = mood.caption;
    renderSceneGrid($("#mood-grid"), PUZZLES.filter((puzzle) => puzzle.mood === mood.id));
    showScreen("screen-mood");
  }

  function metrics() {
    const board = $("#puzzle-board");
    const size = board.clientWidth;
    const { pad, gap } = padGap();
    const inner = Math.max(size - pad * 2, 0);
    const tile = (inner - (GRID - 1) * gap) / GRID;
    const imgW = current._natW || 800;
    const imgH = current._natH || 800;
    const ratio = imgW / imgH || 1;
    let bgW;
    let bgH;
    let offX;
    let offY;
    if (ratio >= 1) {
      bgH = inner;
      bgW = inner * ratio;
      offX = (bgW - inner) / 2;
      offY = 0;
    } else {
      bgW = inner;
      bgH = inner / ratio;
      offX = 0;
      offY = (bgH - inner) / 2;
    }
    return { pad, gap, tile, bgW, bgH, offX, offY };
  }

  function layoutTiles() {
    const m = metrics();
    order.forEach((n, idx) => {
      if (!n) return;
      const row = Math.floor(idx / GRID);
      const col = idx % GRID;
      const el = tileEls[n];
      if (!el) return;
      const x = m.pad + col * (m.tile + m.gap);
      const y = m.pad + row * (m.tile + m.gap);
      const scale = el.classList.contains("is-moving") ? 1.045 : 1;
      el.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + scale + ")";
    });
  }

  function renderBoard() {
    const board = $("#puzzle-board");
    if (!current || !board.clientWidth) return false;
    board.classList.add("settling");
    board.classList.remove("is-loading");
    board.replaceChildren();
    tileEls = {};
    const m = metrics();
    const total = GRID * GRID;
    for (let n = 1; n < total; n += 1) {
      const tile = document.createElement("div");
      tile.className = "puzzle-tile";
      tile.dataset.tile = String(n);
      tile.style.width = m.tile + "px";
      tile.style.height = m.tile + "px";
      tile.style.backgroundColor = PASTELS[(n - 1) % PASTELS.length];
      if (!current._broken) {
        const srcRow = Math.floor((n - 1) / GRID);
        const srcCol = (n - 1) % GRID;
        tile.style.backgroundImage = cssUrl(current.image);
        tile.style.backgroundRepeat = "no-repeat";
        tile.style.backgroundSize = m.bgW + "px " + m.bgH + "px";
        tile.style.backgroundPosition =
          -(m.offX + srcCol * (m.tile + m.gap)) + "px " +
          -(m.offY + srcRow * (m.tile + m.gap)) + "px";
      }
      const label = document.createElement("span");
      label.className = "tile-number";
      label.textContent = String(n);
      tile.appendChild(label);
      tile.setAttribute("role", "button");
      tile.setAttribute("aria-label", "Tile " + n);
      tile.addEventListener("click", () => {
        if (ignoreClick) {
          ignoreClick = false;
          return;
        }
        onTile(order.indexOf(n));
      });
      tileEls[n] = tile;
      board.appendChild(tile);
    }
    layoutTiles();
    window.requestAnimationFrame(() => board.classList.remove("settling"));
    return true;
  }

  function paintBoard(id) {
    let tries = 0;
    const attempt = () => {
      if (id != null && id !== playId) return;
      if (renderBoard() || tries > 60) return;
      tries += 1;
      window.requestAnimationFrame(attempt);
    };
    attempt();
  }

  function deal(id) {
    $("#win-overlay").classList.add("hidden");
    $("#board-wrap").classList.remove("is-solved");
    stopPeek();
    order = CozyShuffle.shuffleTiles(GRID);
    moves = 0;
    updateMoves(false);
    paintBoard(id);
    gameActive = true;
    startTimer();
  }

  function canMove(idx) {
    const empty = order.indexOf(0);
    const emptyRow = Math.floor(empty / GRID);
    const emptyCol = empty % GRID;
    const row = Math.floor(idx / GRID);
    const col = idx % GRID;
    return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);
  }

  function nudge(n) {
    const el = tileEls[n];
    if (!el) return;
    el.classList.remove("nudge");
    void el.offsetWidth;
    el.classList.add("nudge");
  }

  function paintTime() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    $("#stat-time").textContent = m + ":" + String(s).padStart(2, "0");
  }

  function startTimer() {
    seconds = 0;
    window.clearInterval(timer);
    paintTime();
    timer = window.setInterval(() => {
      seconds += 1;
      paintTime();
    }, 1000);
  }

  function stopTimer() {
    window.clearInterval(timer);
  }

  function updateMoves(animate) {
    const el = $("#stat-moves");
    el.textContent = String(moves);
    if (!animate) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function onTile(idx) {
    if (!gameActive || idx < 0) return;
    const n = order[idx];
    if (!n) return;
    if (!canMove(idx)) {
      nudge(n);
      return;
    }
    const el = tileEls[n];
    const empty = order.indexOf(0);
    order[idx] = 0;
    order[empty] = n;
    el.classList.add("is-moving");
    moves += 1;
    updateMoves(true);
    layoutTiles();
    window.setTimeout(() => {
      el.classList.remove("is-moving");
      layoutTiles();
    }, 280);
    if (CozyShuffle.isSolved(order)) {
      gameActive = false;
      const id = playId;
      window.setTimeout(() => {
        if (id === playId) finish();
      }, 300);
    }
  }

  function syncSize() {
    $("#btn-grid-3").setAttribute("aria-pressed", GRID === 3 ? "true" : "false");
    $("#btn-grid-4").setAttribute("aria-pressed", GRID === 4 ? "true" : "false");
  }

  function applyNumbers() {
    document.body.classList.toggle("show-numbers", showNumbers);
    $("#chk-numbers").checked = showNumbers;
  }

  function startGame(art) {
    playId += 1;
    const id = playId;
    current = art;
    current._broken = false;
    gameActive = false;
    stopTimer();
    $("#game-title").textContent = art.title;
    $("#game-place").textContent = art.place || "";
    const ref = $("#game-reference");
    ref.src = art.image;
    ref.alt = "Goal: " + art.title;
    $("#solved-full").src = art.image;
    $("#board-wrap").classList.remove("is-solved");
    $("#win-overlay").classList.add("hidden");
    $("#info-overlay").classList.add("hidden");
    $("#puzzle-board").classList.add("is-loading");
    $("#puzzle-board").replaceChildren();
    tileEls = {};
    moves = 0;
    updateMoves(false);
    showScreen("screen-game");

    const img = new Image();
    const ready = (ok) => {
      if (id !== playId) return;
      current._natW = (ok && img.naturalWidth) || 800;
      current._natH = (ok && img.naturalHeight) || 800;
      if (!ok) {
        current._broken = true;
        showNumbers = true;
        applyNumbers();
      }
      deal(id);
    };
    img.onload = () => ready(true);
    img.onerror = () => ready(false);
    img.src = art.image;
  }

  function shuffleCurrent() {
    if (!current) return;
    deal(playId);
  }

  function setGridSize(n) {
    if ((n !== 3 && n !== 4) || n === GRID) return;
    GRID = n;
    try { localStorage.setItem("cozytiles-grid", String(n)); } catch (e) { /* private mode */ }
    syncSize();
    if (current && $("#screen-game").classList.contains("active")) deal(playId);
  }

  function showHint() {
    if (!gameActive) return;
    const solved = CozyShuffle.solvedState(GRID);
    order.forEach((n, i) => {
      if (n && n === solved[i] && tileEls[n]) tileEls[n].classList.add("correct");
    });
    window.setTimeout(() => {
      Object.keys(tileEls).forEach((key) => tileEls[key].classList.remove("correct"));
    }, 1600);
  }

  function startPeek() {
    if (!gameActive || !current || current._broken) return;
    const peek = $("#peek-overlay");
    peek.style.backgroundImage = cssUrl(current.image);
    peek.classList.add("show");
  }

  function stopPeek() {
    $("#peek-overlay").classList.remove("show");
  }

  function dateKey(date) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function readStreak() {
    try { return parseInt(localStorage.getItem("cozytiles-streak") || "0", 10) || 0; }
    catch (e) { return 0; }
  }

  function bumpStreak() {
    let streak = readStreak();
    try {
      const last = localStorage.getItem("cozytiles-lastwin");
      const today = dateKey(new Date());
      const yesterday = dateKey(new Date(Date.now() - 86400000));
      if (last !== today) {
        streak = last === yesterday ? streak + 1 : 1;
        localStorage.setItem("cozytiles-streak", String(streak));
        localStorage.setItem("cozytiles-lastwin", today);
      }
    } catch (e) { /* private mode */ }
    return streak;
  }

  function saveBest() {
    try {
      const key = "cozytiles-best-" + GRID + "-" + current.id;
      const prev = JSON.parse(localStorage.getItem(key) || "null");
      const better = !prev || moves < prev.moves || (moves === prev.moves && seconds < prev.seconds);
      if (better) localStorage.setItem(key, JSON.stringify({ moves: moves, seconds: seconds }));
      return better;
    } catch (e) {
      return false;
    }
  }

  function finish() {
    stopTimer();
    gameActive = false;
    $("#board-wrap").classList.add("is-solved");
    const id = playId;
    window.setTimeout(() => {
      if (id === playId) showWin();
    }, 680);
  }

  function showWin() {
    const art = current;
    const daily = art.id === todayPuzzle().id;
    $("#win-img").src = art.image;
    $("#win-img").alt = art.title;
    $("#win-name").textContent = art.title;
    $("#win-stats").textContent = moves + " moves · " + $("#stat-time").textContent;
    const streak = daily ? bumpStreak() : 0;
    const streakEl = $("#win-streak");
    if (daily && streak > 0) {
      streakEl.textContent = streak === 1 ? "1 night in a row" : streak + " nights in a row";
      streakEl.classList.remove("hidden");
    } else {
      streakEl.classList.add("hidden");
    }
    $("#win-best").classList.toggle("hidden", !saveBest());
    $("#btn-share").textContent = "Share";
    $("#win-overlay").classList.remove("hidden");
    $("#live").textContent = "All tucked in. " + art.title + " solved in " + moves + " moves.";
    $("#btn-again").focus();
  }

  function shareText() {
    const daily = current && current.id === todayPuzzle().id;
    const lines = [
      "Cozy Tiles" + (daily ? " #" + dayOfYear() : "") + " — " + current.title,
      GRID + "×" + GRID + " · " + moves + " moves · " + $("#stat-time").textContent
    ];
    const streak = readStreak();
    if (daily && streak > 1) lines.push(streak + " nights in a row");
    lines.push(new URL(".", window.location.href).href);
    return lines.join("\n");
  }

  async function shareResult() {
    const text = shareText();
    const btn = $("#btn-share");
    if (navigator.share) {
      try {
        await navigator.share({ text: text });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
      window.setTimeout(() => { btn.textContent = "Share"; }, 1400);
    } catch (e) {
      btn.textContent = "Copy the score above";
    }
  }

  function openInfo() {
    if (!current) return;
    $("#info-title").textContent = current.title;
    $("#info-place").textContent = current.place || "";
    $("#info-caption").textContent = current.caption || "";
    $("#info-overlay").classList.remove("hidden");
    $("#btn-close-info").focus();
  }

  function buildConfetti() {
    const box = $("#confetti");
    if (box.childElementCount) return;
    const heart = '<svg viewBox="0 0 32 32"><path d="M16 27s-8-5.2-11-9.6C2 13.2 3.2 8 7.2 6.4 9.6 5.4 12.2 6.6 13.6 9.2 14.6 10.4 16 12.2 16 12.2s1.4-1.8 2.4-3C20 6.6 22.4 5.4 24.8 6.4 28.8 8 30 13.2 27 17.4 24 21.8 16 27 16 27z" fill="#FF9BB8"/></svg>';
    const star = '<svg viewBox="0 0 32 32"><path d="M16 2.5l3.1 8.8h9.2l-7.4 5.6 2.8 8.8L16 20.6 8.3 25.7l2.8-8.8L3.7 11.3h9.2z" fill="#FFE08A"/></svg>';
    const cloud = '<svg viewBox="0 0 64 40"><g fill="#D7F4FC" stroke="#8FB4D4" stroke-width="2"><ellipse cx="22" cy="26" rx="14" ry="9"/><ellipse cx="40" cy="24" rx="16" ry="11"/><ellipse cx="30" cy="16" rx="12" ry="9"/></g></svg>';
    const kinds = [heart, star, cloud];
    for (let i = 0; i < 12; i += 1) {
      const bit = document.createElement("span");
      bit.className = "bit";
      bit.style.left = (6 + ((i * 19) % 88)) + "%";
      bit.style.animationDelay = (i * 0.18) + "s";
      bit.style.animationDuration = (2.6 + (i % 4) * 0.35) + "s";
      bit.innerHTML = kinds[i % kinds.length];
      box.appendChild(bit);
    }
  }

  function bindTouch() {
    const board = $("#puzzle-board");
    let startX = null;
    let startY = null;
    board.addEventListener("touchstart", (e) => {
      if (!gameActive) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    board.addEventListener("touchend", (e) => {
      if (!gameActive || startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      startY = null;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < 24) return;
      ignoreClick = true;
      const empty = order.indexOf(0);
      const emptyRow = Math.floor(empty / GRID);
      const emptyCol = empty % GRID;
      let idx = -1;
      if (ax > ay) {
        if (dx > 0 && emptyCol > 0) idx = emptyRow * GRID + (emptyCol - 1);
        else if (dx < 0 && emptyCol < GRID - 1) idx = emptyRow * GRID + (emptyCol + 1);
      } else if (dy > 0 && emptyRow > 0) idx = (emptyRow - 1) * GRID + emptyCol;
      else if (dy < 0 && emptyRow < GRID - 1) idx = (emptyRow + 1) * GRID + emptyCol;
      if (idx >= 0) onTile(idx);
    }, { passive: true });
  }

  function bindKeys() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        $("#info-overlay").classList.add("hidden");
        return;
      }
      if (!gameActive || !$("#screen-game").classList.contains("active")) return;
      if (!$("#info-overlay").classList.contains("hidden")) return;
      const empty = order.indexOf(0);
      const emptyRow = Math.floor(empty / GRID);
      const emptyCol = empty % GRID;
      let idx = -1;
      if (e.key === "ArrowUp" && emptyRow < GRID - 1) idx = (emptyRow + 1) * GRID + emptyCol;
      else if (e.key === "ArrowDown" && emptyRow > 0) idx = (emptyRow - 1) * GRID + emptyCol;
      else if (e.key === "ArrowLeft" && emptyCol < GRID - 1) idx = emptyRow * GRID + (emptyCol + 1);
      else if (e.key === "ArrowRight" && emptyCol > 0) idx = emptyRow * GRID + (emptyCol - 1);
      else return;
      e.preventDefault();
      onTile(idx);
    });
  }

  function bindEvents() {
    $("#btn-play").addEventListener("click", () => startGame(todayPuzzle()));
    $("#btn-gallery").addEventListener("click", initGallery);
    $("#btn-moods").addEventListener("click", initMoods);
    $("#btn-gallery-back").addEventListener("click", () => showScreen("screen-home"));
    $("#btn-moods-back").addEventListener("click", () => showScreen("screen-home"));
    $("#btn-mood-back").addEventListener("click", () => showScreen("screen-moods"));
    $("#btn-game-back").addEventListener("click", () => {
      stopTimer();
      gameActive = false;
      stopPeek();
      showScreen("screen-home");
    });
    $("#btn-info").addEventListener("click", openInfo);
    $("#btn-close-info").addEventListener("click", () => $("#info-overlay").classList.add("hidden"));
    $("#info-overlay").addEventListener("click", (e) => {
      if (e.target === $("#info-overlay")) $("#info-overlay").classList.add("hidden");
    });
    $("#btn-grid-3").addEventListener("click", () => setGridSize(3));
    $("#btn-grid-4").addEventListener("click", () => setGridSize(4));
    $("#btn-shuffle").addEventListener("click", shuffleCurrent);
    $("#btn-hint").addEventListener("click", showHint);
    $("#chk-numbers").addEventListener("change", (e) => {
      showNumbers = e.target.checked;
      applyNumbers();
      try { localStorage.setItem("cozytiles-numbers", showNumbers ? "1" : "0"); } catch (err) { /* private mode */ }
    });

    const peekBtn = $("#btn-peek");
    peekBtn.addEventListener("mousedown", startPeek);
    peekBtn.addEventListener("mouseup", stopPeek);
    peekBtn.addEventListener("mouseleave", stopPeek);
    peekBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startPeek();
    }, { passive: false });
    peekBtn.addEventListener("touchend", stopPeek);
    peekBtn.addEventListener("touchcancel", stopPeek);

    $("#btn-share").addEventListener("click", shareResult);
    $("#btn-again").addEventListener("click", shuffleCurrent);
    $("#btn-next").addEventListener("click", () => {
      const index = PUZZLES.findIndex((puzzle) => puzzle.id === current.id);
      startGame(PUZZLES[(index + 1) % PUZZLES.length]);
    });
    $("#btn-win-home").addEventListener("click", () => {
      $("#win-overlay").classList.add("hidden");
      showScreen("screen-home");
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      if (!current || !$("#screen-game").classList.contains("active")) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => paintBoard(playId), 120);
    });
  }

  function init() {
    if (!window.PUZZLES || !PUZZLES.length) {
      $("#featured-title").textContent = "Add a scene";
      $("#featured-caption").textContent = "Put a picture in images/ and a line in puzzles.js.";
      return;
    }
    applyNumbers();
    syncSize();
    buildConfetti();
    bindEvents();
    bindKeys();
    bindTouch();
    initHome();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
