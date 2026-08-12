/* ==========================================================================
   KSA 2026 — Live Programme · UI
   Renders programme days, faculty, search, My Schedule and the live now-bar.
   ========================================================================== */

const $  = id => document.getElementById(id);
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Conference-local clock (Africa/Nairobi) ─────────────────────────────── */
function confNow() {
  const s = new Date().toLocaleString('en-US', { timeZone: CONF.tz });
  return new Date(s);
}
const p2 = n => String(n).padStart(2, '0');
function nowHHMM() { const d = confNow(); return p2(d.getHours()) + ':' + p2(d.getMinutes()); }
function todayISO() {
  const d = confNow();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
function msUntil(hhmm) {
  const d = confNow(); const [h, m] = hhmm.split(':').map(Number);
  const t = new Date(d); t.setHours(h, m, 0, 0);
  return t - d;
}
const addMins = (hhmm, mins) => {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + mins;
  return p2(Math.floor(((t % 1440) + 1440) % 1440 / 60)) + ':' + p2(((t % 60) + 60) % 60);
};

/* ── Local state ─────────────────────────────────────────────────────────── */
const STAR_KEY = 'ksa26_stars';
let stars = new Set(JSON.parse(localStorage.getItem(STAR_KEY) || '[]'));
const saveStars = () => localStorage.setItem(STAR_KEY, JSON.stringify([...stars]));

let currentTab = 'day1';
let query = '';

/* ── Session status relative to the live clock ───────────────────────────── */
function statusOf(item) {
  if (item.date !== todayISO()) return '';
  const now = nowHHMM();
  if (item.s <= now && item.e > now) return 'live';
  if (item.e <= now) return 'past';
  return '';
}

/* Ids of the next session(s) due to start today — parallel tracks all qualify. */
let nextIds = new Set();
function computeNext() {
  const date = todayISO(), now = nowHHMM();
  const upcoming = FLAT.filter(f => f.date === date && f.kind !== 'discussion' && f.s > now);
  if (!upcoming.length) return new Set();
  const soonest = upcoming.reduce((m, f) => (f.s < m ? f.s : m), '99:99');
  return new Set(upcoming.filter(f => f.s === soonest).map(f => f.id));
}
/* Signature of everything time-dependent on screen — re-render only on change. */
function liveSignature() {
  const date = todayISO(), now = nowHHMM();
  return date + '|' + now.slice(0, 4) + '|' +
    FLAT.filter(f => f.date === date && f.s <= now && f.e > now).map(f => f.id).join(',') +
    '|' + [...nextIds].join(',');
}
const minsUntil = hhmm => Math.max(0, Math.round(msUntil(hhmm) / 60000));
const matches = item => {
  if (!query) return true;
  const hay = (item.title + ' ' + (item.speakers || []).join(' ') + ' ' +
               (item.track || '') + ' ' + (item.room || '')).toLowerCase();
  return query.split(/\s+/).filter(Boolean).every(w => hay.includes(w));
};

/* ── Session row ─────────────────────────────────────────────────────────── */
function sessRow(item) {
  const st = statusOf(item);
  const hit = query && matches(item) ? ' hit' : '';
  const starred = stars.has(item.id);
  const speakers = (item.speakers || []).filter(Boolean);
  return `
    <div class="sess ${item.kind === 'discussion' ? 'discussion' : ''} ${st}${hit}" data-id="${item.id}">
      <div class="s-time">${item.s}<span class="e">${item.e}</span></div>
      <div class="s-main">
        <div class="s-title">${esc(item.title)}</div>
        ${speakers.length ? `<div class="s-speakers"><i class="fas fa-microphone"></i>${speakers.map(esc).join(' · ')}</div>` : ''}
        ${st === 'live' ? '<div class="s-badges"><span class="badge-live">LIVE NOW</span></div>'
          : nextIds.has(item.id) ? `<div class="s-badges"><span class="badge-next">UP NEXT · in ${minsUntil(item.s)} min</span></div>` : ''}
      </div>
      ${item.kind === 'discussion' ? '' :
        `<button class="star-btn ${starred ? 'on' : ''}" data-star="${item.id}"
           title="Add to My Schedule" aria-label="Add to My Schedule">
           <i class="${starred ? 'fas' : 'far'} fa-star"></i></button>`}
    </div>`;
}

/* ── Track column ────────────────────────────────────────────────────────── */
function trackCol(track, blockIdx, dayId, groupIdx) {
  const color = TRACK_COLORS[track.name] || 'var(--day)';
  const items = track.sessions.map((s, si) =>
    FLAT.find(f => f.id === `${dayId}-${blockIdx}-${groupIdx}-${si}`) || s);
  return `
    <div class="track" style="--tc:${color}">
      <div class="track-head">
        <div class="track-name">${esc(track.name)}</div>
        ${track.subtitle ? `<div class="track-sub">${esc(track.subtitle)}</div>` : ''}
        ${track.room ? `<div class="track-room"><i class="fas fa-location-dot"></i>${esc(track.room)}</div>` : ''}
        ${track.chairs?.length ? `<div class="track-chairs"><strong>Chairs:</strong> ${track.chairs.map(esc).join(' · ')}</div>` : ''}
      </div>
      <div class="track-body">${items.map(sessRow).join('')}</div>
      ${track.sponsor ? sponsorStrip(track.sponsor) : ''}
    </div>`;
}

const SPONSORS = {
  smiletrain: { img: 'logos/smiletrain.png', alt: 'Smile Train' },
  fresenius:  { img: 'logos/fresenius.png',  alt: 'Fresenius Kabi' },
};
function sponsorStrip(key) {
  const s = SPONSORS[key];
  if (!s) return '';
  return `<div class="sponsor-strip"><span class="lbl">In partnership with</span><img src="${s.img}" alt="${esc(s.alt)}"></div>`;
}

/* ── Day view ────────────────────────────────────────────────────────────── */
function renderDay(dayId) {
  const day = DAYS.find(d => d.id === dayId);
  const blocks = PROGRAM[dayId] || [];
  let html = '';

  blocks.forEach((block, bi) => {
    if (block.type === 'break') {
      const item = FLAT.find(f => f.id === `${dayId}-b${bi}`);
      const st = item ? statusOf(item) : '';
      html += `
        <div class="break-card ${block.highlight ? 'highlight' : ''} ${st === 'past' ? 'past' : ''}"
             style="${st === 'live' ? 'border-color:var(--day);border-style:solid' : ''}">
          <i class="fas ${block.icon || 'fa-circle-dot'}"></i>
          <div>
            <div class="bt">${esc(block.title)}${st === 'live' ? ' <span class="badge-live">LIVE NOW</span>' : ''}</div>
            ${block.note ? `<div class="bm">${esc(block.note)}</div>` : ''}
            ${block.room ? `<div class="bm">${esc(block.room)}</div>` : ''}
          </div>
          <div class="btime">${block.s} – ${block.e}</div>
        </div>`;
      return;
    }

    const label = block.label || block.title || '';
    html += `<div class="time-label"><span class="t">${block.s} – ${block.e}</span>${label ? '· ' + esc(label) : ''}</div>`;

    if (block.type === 'parallel') {
      const n = block.tracks.length;
      const cols = n >= 4 ? 'cols-4' : 'cols-2';
      const isWorkshop = /workshop/i.test(block.label || '');
      html += `<div class="swipe-hint">
          <span class="hand-l">👈</span>
          ${isWorkshop ? 'Swipe to browse workshops' : 'Swipe between tracks'}
          <span class="count">${n}</span>
          <span class="hand-r">👉</span>
        </div>`;
      html += `<div class="track-grid ${cols}">` +
        block.tracks.map((t, gi) => trackCol(t, bi, dayId, gi)).join('') + '</div>';
    } else {
      html += '<div class="track-grid single">' + trackCol({
        name: block.title, room: block.room, chairs: block.chairs,
        sessions: block.sessions, sponsor: block.sponsor,
        subtitle: block.note,
      }, bi, dayId, 0) + '</div>';
    }
  });

  return `<div class="day-meta">${html}</div>`;
}

/* ── Faculty view ────────────────────────────────────────────────────────── */
function renderFaculty() {
  const list = FACULTY.filter(f => !query ||
    f.name.toLowerCase().includes(query) ||
    f.talks.some(t => t.title.toLowerCase().includes(query)));
  if (!list.length) return `<div class="empty"><i class="fas fa-user-slash"></i>No faculty match “${esc(query)}”.</div>`;

  return `<div class="fac-grid">${list.map(f => {
    const dayOf = id => DAYS.find(d => d.id === id)?.label || '';
    return `
      <div class="fac-card">
        <div class="fac-name">${esc(f.name)}</div>
        <div class="fac-roles">
          ${f.talks.length ? `<span class="fac-tag spk">${f.talks.length} talk${f.talks.length > 1 ? 's' : ''}</span>` : ''}
          ${f.chairs.length ? `<span class="fac-tag chr">Session chair</span>` : ''}
        </div>
        <div class="fac-talks">
          ${f.talks.slice(0, 4).map(t =>
            `<div>· ${esc(t.title.length > 92 ? t.title.slice(0, 92) + '…' : t.title)}
               <br><span style="opacity:.75">${dayOf(t.dayId)} ${t.s} · ${esc(t.room || '')}</span></div>`).join('')}
          ${f.chairs.length ? `<div style="margin-top:6px">· Chairs <em>${esc([...new Set(f.chairs.map(c => c.track))].join(', '))}</em></div>` : ''}
        </div>
      </div>`;
  }).join('')}</div>`;
}

/* ── My Schedule ─────────────────────────────────────────────────────────── */
function renderMySchedule() {
  const mine = FLAT.filter(f => stars.has(f.id))
    .sort((a, b) => (a.date + a.s).localeCompare(b.date + b.s));
  if (!mine.length) {
    return `<div class="empty"><i class="far fa-star"></i>
      No sessions saved yet.<br>Tap the ☆ next to any session to build your personal programme.</div>`;
  }
  let html = '', lastDay = '';
  const conflicts = new Set();
  mine.forEach((a, i) => mine.slice(i + 1).forEach(b => {
    if (a.date === b.date && a.s < b.e && b.s < a.e) { conflicts.add(a.id); conflicts.add(b.id); }
  }));

  mine.forEach(item => {
    if (item.dayId !== lastDay) {
      lastDay = item.dayId;
      const d = DAYS.find(x => x.id === item.dayId);
      html += `<div class="time-label"><span class="t">${d.label}</span>· ${d.sub}</div>`;
    }
    const clash = conflicts.has(item.id);
    html += `
      <div class="track" style="--tc:${TRACK_COLORS[item.track] || 'var(--day)'};margin-bottom:9px">
        <div class="track-body">${sessRow(item)}</div>
        ${clash ? `<div style="padding:7px 14px;background:#fff8e1;font-size:.72rem;color:#8d6e63;font-weight:600">
          <i class="fas fa-triangle-exclamation"></i> Overlaps with another saved session</div>` : ''}
      </div>`;
  });
  return `<div class="panel-hint" style="margin-top:14px">
    ${mine.length} saved session${mine.length > 1 ? 's' : ''}${conflicts.size ? ` · ${conflicts.size / 2 | 0} clash(es)` : ''}
    — stored on this device only.</div>` + html;
}

/* ── Search results (across all days) ────────────────────────────────────── */
function renderSearch() {
  const hits = FLAT.filter(f => f.kind !== 'discussion' && matches(f));
  if (!hits.length) return `<div class="empty"><i class="fas fa-magnifying-glass"></i>Nothing matches “${esc(query)}”.</div>`;
  let html = `<div class="panel-hint" style="margin-top:14px">${hits.length} result${hits.length > 1 ? 's' : ''} for “${esc(query)}”</div>`;
  let lastDay = '';
  hits.forEach(item => {
    if (item.dayId !== lastDay) {
      lastDay = item.dayId;
      const d = DAYS.find(x => x.id === item.dayId);
      html += `<div class="time-label"><span class="t">${d.label}</span>· ${d.sub}</div>`;
    }
    html += `<div class="track" style="--tc:${TRACK_COLORS[item.track] || 'var(--day)'};margin-bottom:9px">
      <div class="track-body">${sessRow(item)}</div>
      ${item.track ? `<div class="sponsor-strip"><span class="lbl">${esc(item.track)}${item.room ? ' · ' + esc(item.room) : ''}</span></div>` : ''}
    </div>`;
  });
  return html;
}

/* ── Tab switching ───────────────────────────────────────────────────────── */
function showTab(id) {
  currentTab = id;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  const day = DAYS.find(d => d.id === id);
  document.documentElement.style.setProperty('--day',
    day ? day.color : ({ faculty: '#6a1b9a', mine: '#b45309', qa: '#00695c', poll: '#c2185b', lost: '#5d4037' }[id] || 'var(--green)'));
  render();
  window.scrollTo(0, 0);
}

function render() {
  const out = $('view');
  const toolbar = $('toolbar');
  const isProgram = DAYS.some(d => d.id === currentTab) || currentTab === 'mine' || currentTab === 'faculty';
  toolbar.classList.toggle('hidden', !isProgram);
  nextIds = computeNext();

  // Keep the reader's place in each swipe carousel across a live re-render
  const scrolls = [...out.querySelectorAll('.track-grid')].map(g => g.scrollLeft);
  const restore = () => [...out.querySelectorAll('.track-grid')]
    .forEach((g, i) => { if (scrolls[i]) g.scrollLeft = scrolls[i]; });

  if (query && DAYS.some(d => d.id === currentTab)) { out.innerHTML = renderSearch(); return; }

  switch (currentTab) {
    case 'faculty': out.innerHTML = renderFaculty(); break;
    case 'mine':    out.innerHTML = renderMySchedule(); break;
    case 'qa':      out.innerHTML = LIVE.renderQAPanel(); LIVE.qaInit(); break;
    case 'poll':    out.innerHTML = LIVE.renderPollPanel(); LIVE.pollInit(); break;
    case 'lost':    out.innerHTML = LIVE.renderLFPanel(); LIVE.lfInit(); break;
    default:        out.innerHTML = renderDay(currentTab); restore();
  }
  updateStarCount();
}

function updateStarCount() {
  const pill = $('star-count');
  if (!pill) return;
  pill.textContent = stars.size;
  pill.classList.toggle('hidden', stars.size === 0);
}

/* ── Live now-bar + alerts ───────────────────────────────────────────────── */
function updateNowBar() {
  const bar = $('now-bar');
  const date = todayISO(), now = nowHHMM();
  const live = FLAT
    .filter(f => f.date === date && f.kind !== 'discussion' && f.s <= now && f.e > now)
    .sort((a, b) => a.e.localeCompare(b.e));

  if (!live.length) {
    // Nothing live — show the next upcoming item today, if any.
    const next = FLAT.filter(f => f.date === date && f.s > now)
      .sort((a, b) => a.s.localeCompare(b.s))[0];
    if (!next) { bar.classList.add('hidden'); document.body.style.paddingBottom = ''; return; }
    $('nb-live').textContent = 'NEXT';
    $('nb-live').style.background = '#4338ca';
    $('nb-title').textContent = next.title;
    $('nb-meta').textContent = [next.speakers?.join(' · '), next.room, next.track].filter(Boolean).join(' · ');
    const ms = Math.max(0, msUntil(next.s));
    $('nb-timer').textContent = 'in ' + p2(Math.floor(ms / 60000)) + ':' + p2(Math.floor(ms % 60000 / 1000));
    $('nb-timer').className = 'nb-timer';
    bar.classList.remove('hidden');
    document.body.style.paddingBottom = '62px';
    return;
  }

  const cur = live[0];
  $('nb-live').textContent = 'LIVE';
  $('nb-live').style.background = 'var(--red)';
  $('nb-title').textContent = cur.title;
  $('nb-meta').textContent = [
    cur.speakers?.join(' · '), cur.room, cur.track,
    live.length > 1 ? `+${live.length - 1} parallel` : '',
  ].filter(Boolean).join(' · ');

  const ms = Math.max(0, msUntil(cur.e));
  const mins = Math.floor(ms / 60000), secs = Math.floor(ms % 60000 / 1000);
  const t = $('nb-timer');
  t.textContent = p2(mins) + ':' + p2(secs);
  t.className = 'nb-timer' + (mins < 5 ? ' urgent' : '');
  bar.classList.remove('hidden');
  document.body.style.paddingBottom = '62px';
}

/* Alerts fire on a *window*, not an exact minute match — a backgrounded tab
   throttles timers, so "now === e-5" could be skipped entirely and the
   reminder lost. Anything still inside its window fires on the next tick. */
const fired = new Set();
const FIVE_MIN = 5 * 60 * 1000;

function checkAlerts() {
  const date = todayISO();
  FLAT.forEach(f => {
    if (f.date !== date || f.kind === 'discussion' || f.kind === 'break') return;
    const toEnd   = msUntil(f.e);
    const toStart = msUntil(f.s);

    // Speaker warning — 5 minutes of session time left
    if (toEnd > 0 && toEnd <= FIVE_MIN && !fired.has('w' + f.id)) {
      fired.add('w' + f.id);
      toast(`⏱️ <strong>5 minutes to go</strong><br>${esc(f.title)}` +
            `<br><small>${esc([f.speakers?.join(' · '), f.room].filter(Boolean).join(' · '))}</small>`);
    }
    // Time's up
    if (toEnd <= 0 && toEnd > -FIVE_MIN && !fired.has('e' + f.id)) {
      fired.add('e' + f.id);
      toast(`🔔 <strong>Time's up</strong><br>${esc(f.title)}<br><small>${esc(f.room || '')}</small>`);
    }
    // Starred session about to begin
    if (stars.has(f.id) && toStart > 0 && toStart <= FIVE_MIN && !fired.has('s' + f.id)) {
      fired.add('s' + f.id);
      toast(`⭐ <strong>Starts in ${Math.max(1, Math.round(toStart / 60000))} min</strong><br>${esc(f.title)}` +
            `<br><small>${esc(f.room || '')}</small>`);
    }
  });
}

/* Parallel tracks mean two sessions can hit the same milestone at once,
   so toasts stack instead of replacing one another. */
const toasts = [];
function toast(html) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  document.body.appendChild(el);
  toasts.push(el);
  while (toasts.length > 3) toasts.shift()?.remove();
  layoutToasts();
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.remove();
      const i = toasts.indexOf(el);
      if (i > -1) toasts.splice(i, 1);
      layoutToasts();
    }, 400);
  }, 9000);
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('KSA 2026', { body: el.textContent });
  }
}
function layoutToasts() {
  const base = document.body.style.paddingBottom ? 74 : 16;
  toasts.forEach((t, i) => { t.style.bottom = (base + i * 88) + 'px'; });
}

function updateClock() {
  const d = confNow();
  $('clock').textContent = p2(d.getHours()) + ':' + p2(d.getMinutes());
}

/* ── Wiring ──────────────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) { showTab(tab.dataset.tab); return; }

  const star = e.target.closest('[data-star]');
  if (star) {
    const id = star.dataset.star;
    stars.has(id) ? stars.delete(id) : stars.add(id);
    saveStars();
    star.classList.toggle('on', stars.has(id));
    star.innerHTML = `<i class="${stars.has(id) ? 'fas' : 'far'} fa-star"></i>`;
    updateStarCount();
    if (currentTab === 'mine') render();
  }
});

function init() {
  // Tabs
  $('tabs').innerHTML =
    DAYS.map(d => `<button class="tab" data-tab="${d.id}">${d.label}<small>${d.sub}</small></button>`).join('') +
    `<button class="tab" data-tab="faculty"><i class="fas fa-user-tie"></i><small>Faculty</small></button>
     <button class="tab" data-tab="mine"><i class="fas fa-star"></i><small>My Schedule</small><span class="pill hidden" id="star-count">0</span></button>
     <button class="tab" data-tab="qa"><i class="fas fa-circle-question"></i><small>Ask</small></button>
     <button class="tab" data-tab="poll"><i class="fas fa-chart-simple"></i><small>Live Poll</small></button>
     <button class="tab" data-tab="lost"><i class="fas fa-box-open"></i><small>Lost &amp; Found</small></button>`;

  $('search').addEventListener('input', e => {
    query = e.target.value.trim().toLowerCase();
    $('clear-search').classList.toggle('hidden', !query);
    render();
  });
  $('clear-search').addEventListener('click', () => {
    query = ''; $('search').value = ''; $('clear-search').classList.add('hidden'); render();
  });

  // Open on today if the conference is running, otherwise Day 1
  const today = todayISO();
  const todayTab = DAYS.find(d => d.date === today);
  showTab(todayTab ? todayTab.id : 'day1');

  updateClock(); updateNowBar(); checkAlerts();
  setInterval(updateClock, 10000);
  setInterval(updateNowBar, 1000);
  setInterval(checkAlerts, 15000);

  // Repaint LIVE / UP NEXT only when the state actually changes, so a reader
  // mid-swipe isn't yanked back by a pointless re-render.
  let lastSig = liveSignature();
  setInterval(() => {
    if (!DAYS.some(d => d.id === currentTab) || query) return;
    nextIds = computeNext();
    const sig = liveSignature();
    if (sig !== lastSig) { lastSig = sig; render(); }
  }, 15000);

  // A tab returning to the foreground may have missed several ticks
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    updateClock(); updateNowBar(); checkAlerts();
    if (DAYS.some(d => d.id === currentTab) && !query) render();
  });

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    document.addEventListener('click', () => Notification.requestPermission(), { once: true });
  }
  LIVE.announceInit();
}

document.addEventListener('DOMContentLoaded', init);
