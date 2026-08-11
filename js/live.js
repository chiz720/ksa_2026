/* ==========================================================================
   KSA 2026 — Live features (Google Apps Script backed)
   Q&A · Live Polls · Lost & Found · Announcement bar
   Falls back to localStorage-only demo mode when GS_URL is empty.
   ========================================================================== */

const LIVE = (() => {

  const POLL_MS = 20000;
  const DEVICE_ID = (() => {
    let id = localStorage.getItem('ksa26_device');
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('ksa26_device', id);
    }
    return id;
  })();

  const online = () => !!GS_URL;
  const post = body => {
    if (!online()) return Promise.resolve();
    return fetch(GS_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    }).catch(() => {});
  };
  const get = async type => {
    if (!online()) return null;
    try {
      const r = await fetch(`${GS_URL}?type=${type}&t=${Date.now()}`);
      return await r.json();
    } catch { return null; }
  };
  const stamp = () => confNow().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const flash = (id, text, kind) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'msg ' + kind;
    setTimeout(() => { if (el.isConnected) el.className = 'msg hidden'; }, 5000);
  };
  const offlineNote = () => online() ? '' :
    `<div class="msg err" style="margin-bottom:11px"><i class="fas fa-plug-circle-xmark"></i>
      Offline demo mode — posts stay on this device. Add your Apps Script URL to
      <code>js/config.js</code> to go live.</div>`;

  /* ─────────────────────────── Q & A ─────────────────────────── */
  let qaItems = [];
  let qaUpvoted = JSON.parse(localStorage.getItem('ksa26_qa_up') || '{}');
  let qaTimer = null;

  function renderQAPanel() {
    const opts = QA_SESSIONS.map(s => `<option value="${esc(s.value)}">${esc(s.value)}</option>`).join('');
    return `
      <div class="panel">
        <div class="panel-title">Ask the speaker</div>
        <div class="panel-hint">Questions go straight to the session chair's screen. Upvote the ones you want answered.</div>
        ${offlineNote()}
        <select class="field" id="qa-session">
          <option value="">Select the session…</option>${opts}
        </select>
        <textarea class="field" id="qa-question" maxlength="300" placeholder="Type your question…"></textarea>
        <input class="field" id="qa-name" maxlength="60" placeholder="Your name (optional)">
        <button class="btn-primary" onclick="LIVE.qaSubmit()"><i class="fas fa-paper-plane"></i> Submit question</button>
        <div class="msg hidden" id="qa-msg"></div>
      </div>
      <div id="qa-list"></div>`;
  }

  function renderQAList() {
    const list = document.getElementById('qa-list');
    if (!list) return;
    if (!qaItems.length) {
      list.innerHTML = `<div class="empty"><i class="fas fa-microphone-slash"></i>No questions yet — be the first.</div>`;
      return;
    }
    list.innerHTML = [...qaItems].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).map(q => `
      <div class="qa-card">
        <div class="qa-top">
          <span class="qa-tag">${esc(q.session || 'General')}</span>
          <button class="qa-up ${qaUpvoted[q.id] ? 'voted' : ''}" ${qaUpvoted[q.id] ? 'disabled' : ''}
                  onclick="LIVE.qaUpvote('${esc(q.id)}')">
            <i class="fas fa-chevron-up"></i>${q.upvotes || 0}
          </button>
        </div>
        <div class="qa-q">${esc(q.question)}</div>
        <div class="qa-meta">
          <span><i class="fas fa-user"></i> ${esc(q.name || 'Anonymous')}</span>
          ${q.ts ? `<span><i class="fas fa-clock"></i> ${esc(q.ts)}</span>` : ''}
        </div>
      </div>`).join('');
  }

  async function qaFetch() {
    const data = await get('qa');
    if (Array.isArray(data)) qaItems = data;
    else if (!online()) qaItems = JSON.parse(localStorage.getItem('ksa26_qa') || '[]');
    renderQAList();
  }

  function qaInit() {
    qaFetch();
    clearInterval(qaTimer);
    qaTimer = setInterval(() => {
      if (document.getElementById('qa-list')) qaFetch(); else clearInterval(qaTimer);
    }, POLL_MS);
  }

  async function qaSubmit() {
    const session  = document.getElementById('qa-session').value.trim();
    const question = document.getElementById('qa-question').value.trim();
    const name     = document.getElementById('qa-name').value.trim() || 'Anonymous';
    if (!session)  return flash('qa-msg', 'Please choose the session.', 'err');
    if (!question) return flash('qa-msg', 'Please type your question.', 'err');

    const rec = { action: 'qa_submit', id: 'qa_' + Date.now(), session, question, name, upvotes: 0, ts: stamp() };
    qaItems.unshift(rec);
    if (!online()) localStorage.setItem('ksa26_qa', JSON.stringify(qaItems));
    renderQAList();
    document.getElementById('qa-question').value = '';
    flash('qa-msg', 'Sent — the chair will see it shortly.', 'ok');
    post(rec);
  }

  function qaUpvote(id) {
    if (qaUpvoted[id]) return;
    qaUpvoted[id] = true;
    localStorage.setItem('ksa26_qa_up', JSON.stringify(qaUpvoted));
    const q = qaItems.find(i => i.id === id);
    if (q) q.upvotes = (q.upvotes || 0) + 1;
    if (!online()) localStorage.setItem('ksa26_qa', JSON.stringify(qaItems));
    renderQAList();
    post({ action: 'qa_upvote', id });
  }

  /* ─────────────────────────── Live polls ─────────────────────────── */
  let polls = [];
  let voted = JSON.parse(localStorage.getItem('ksa26_poll_voted') || '{}');
  let pollTimer = null;

  function renderPollPanel() {
    return `
      <div class="panel">
        <div class="panel-title">Live polls</div>
        <div class="panel-hint">Polls open during sessions. Results update every 20 seconds.</div>
        ${offlineNote()}
      </div>
      <div id="poll-list"><div class="empty"><i class="fas fa-spinner fa-spin"></i>Loading polls…</div></div>`;
  }

  function renderPolls() {
    const list = document.getElementById('poll-list');
    if (!list) return;
    if (!polls.length) {
      list.innerHTML = `<div class="empty"><i class="fas fa-chart-simple"></i>No poll is open right now.<br>Check back during the next session.</div>`;
      return;
    }
    list.innerHTML = polls.map(p => {
      const didVote = voted[p.id] !== undefined;
      const max = Math.max(...(p.votes || [0]), 1);
      const opts = p.options.map((opt, i) => {
        const n = (p.votes || [])[i] || 0;
        const pct = p.total > 0 ? Math.round(n / p.total * 100) : 0;
        if (!didVote) {
          return `<button class="poll-opt" onclick="LIVE.vote('${esc(p.id)}',${i})">
            <div class="poll-row"><span>${esc(opt)}</span></div></button>`;
        }
        return `<button class="poll-opt ${n === max && n > 0 ? 'winner' : ''}" disabled>
          <div class="poll-bar" style="width:${pct}%"></div>
          <div class="poll-row"><span>${esc(opt)}${voted[p.id] === i ? ' ✓' : ''}</span><span>${pct}%</span></div>
        </button>`;
      }).join('');
      return `<div class="poll-card">
        <span class="badge-live">LIVE</span>
        <div class="poll-q">${esc(p.question)}</div>${opts}
        <div class="poll-total">${p.total || 0} vote${p.total === 1 ? '' : 's'} cast</div>
      </div>`;
    }).join('');
  }

  async function pollFetch() {
    const data = await get('polls');
    polls = Array.isArray(data) ? data : [];
    renderPolls();
  }

  function pollInit() {
    pollFetch();
    clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (document.getElementById('poll-list')) pollFetch(); else clearInterval(pollTimer);
    }, POLL_MS);
  }

  function vote(pollId, i) {
    if (voted[pollId] !== undefined) return;
    voted[pollId] = i;
    localStorage.setItem('ksa26_poll_voted', JSON.stringify(voted));
    const p = polls.find(x => x.id === pollId);
    if (p) { p.votes[i] = (p.votes[i] || 0) + 1; p.total = (p.total || 0) + 1; }
    renderPolls();
    post({ action: 'poll_vote', poll_id: pollId, option_index: i, device_id: DEVICE_ID });
  }

  /* ─────────────────────────── Lost & Found ─────────────────────────── */
  let lfItems = [];
  let lfType = 'lost', lfFilterVal = 'open', lfTimer = null;

  function renderLFPanel() {
    return `
      <div class="panel">
        <div class="panel-title">Lost &amp; Found</div>
        <div class="panel-hint">Post what you have lost or found. Everyone at the conference sees it within 20 seconds.</div>
        ${offlineNote()}
        <div class="seg">
          <button class="active" id="lf-btn-lost"  onclick="LIVE.lfSetType('lost')">I lost something</button>
          <button              id="lf-btn-found" onclick="LIVE.lfSetType('found')">I found something</button>
        </div>
        <input class="field" id="lf-item"    maxlength="80"  placeholder="Item (e.g. black laptop bag)">
        <input class="field" id="lf-desc"    maxlength="120" placeholder="Description / colour / markings">
        <input class="field" id="lf-loc"     maxlength="80"  placeholder="Where (e.g. Baraza hall, beach foyer)">
        <input class="field" id="lf-name"    maxlength="60"  placeholder="Your name">
        <input class="field" id="lf-contact" maxlength="80"  placeholder="Contact (phone or email)">
        <button class="btn-primary" onclick="LIVE.lfSubmit()"><i class="fas fa-plus"></i> Post item</button>
        <div class="msg hidden" id="lf-msg"></div>
      </div>
      <div class="seg" style="margin-top:14px">
        <button class="active" id="lf-f-open"     onclick="LIVE.lfFilter('open')">Open</button>
        <button              id="lf-f-resolved" onclick="LIVE.lfFilter('resolved')">Resolved</button>
      </div>
      <div id="lf-list"></div>`;
  }

  function renderLF() {
    const list = document.getElementById('lf-list');
    if (!list) return;
    const vis = lfItems.filter(i => lfFilterVal === 'resolved' ? i.resolved : !i.resolved);
    if (!vis.length) {
      list.innerHTML = `<div class="empty"><i class="fas fa-box-open"></i>Nothing here yet.</div>`;
      return;
    }
    list.innerHTML = vis.map(i => `
      <div class="lf-card ${esc(i.type)} ${i.resolved ? 'resolved' : ''}">
        <div class="lf-top">
          <div>
            <div class="lf-name">${esc(i.item)}</div>
            ${i.desc ? `<div class="lf-desc">${esc(i.desc)}</div>` : ''}
          </div>
          <span class="lf-badge ${i.resolved ? 'resolved' : esc(i.type)}">${i.resolved ? 'RESOLVED' : String(i.type).toUpperCase()}</span>
        </div>
        <div class="lf-meta">
          ${i.loc ? `<span><i class="fas fa-location-dot"></i> ${esc(i.loc)}</span>` : ''}
          <span><i class="fas fa-user"></i> ${esc(i.name)}</span>
          <span><i class="fas fa-phone"></i> ${esc(i.contact)}</span>
          ${i.ts ? `<span><i class="fas fa-clock"></i> ${esc(i.ts)}</span>` : ''}
        </div>
        ${i.resolved ? '' : `<button class="lf-claim" onclick="LIVE.lfResolve('${esc(i.id)}')">
          ${i.type === 'lost' ? 'I found this!' : 'This is mine!'}</button>`}
      </div>`).join('');
  }

  async function lfFetch() {
    const data = await get('lostfound');
    if (Array.isArray(data)) lfItems = data;
    else if (!online()) lfItems = JSON.parse(localStorage.getItem('ksa26_lf') || '[]');
    renderLF();
  }

  function lfInit() {
    lfFetch();
    clearInterval(lfTimer);
    lfTimer = setInterval(() => {
      if (document.getElementById('lf-list')) lfFetch(); else clearInterval(lfTimer);
    }, POLL_MS);
  }

  function lfSetType(t) {
    lfType = t;
    document.getElementById('lf-btn-lost').classList.toggle('active', t === 'lost');
    document.getElementById('lf-btn-found').classList.toggle('active', t === 'found');
  }

  function lfFilter(f) {
    lfFilterVal = f;
    document.getElementById('lf-f-open').classList.toggle('active', f === 'open');
    document.getElementById('lf-f-resolved').classList.toggle('active', f === 'resolved');
    renderLF();
  }

  function lfSubmit() {
    const v = id => document.getElementById(id).value.trim();
    const item = v('lf-item'), name = v('lf-name'), contact = v('lf-contact');
    if (!item || !name || !contact) return flash('lf-msg', 'Item, your name and a contact are required.', 'err');

    const rec = {
      id: 'lf_' + Date.now(), type: lfType, item, desc: v('lf-desc'), loc: v('lf-loc'),
      name, contact, resolved: false, ts: stamp(),
    };
    lfItems.unshift(rec);
    if (!online()) localStorage.setItem('ksa26_lf', JSON.stringify(lfItems));
    renderLF();
    ['lf-item', 'lf-desc', 'lf-loc'].forEach(id => document.getElementById(id).value = '');
    flash('lf-msg', 'Posted — everyone will see it within 20 seconds.', 'ok');
    post(rec);
  }

  function lfResolve(id) {
    lfItems = lfItems.map(i => i.id === id ? { ...i, resolved: true } : i);
    if (!online()) localStorage.setItem('ksa26_lf', JSON.stringify(lfItems));
    renderLF();
    post({ action: 'resolve', id });
  }

  /* ─────────────────────────── Announcements ─────────────────────────── */
  let lastMsg = '';
  async function announceCheck() {
    const data = await get('announcement');
    const bar = document.getElementById('announce');
    if (!bar) return;
    if (data && data.active && data.message) {
      if (data.message !== lastMsg) {
        lastMsg = data.message;
        document.getElementById('announce-text').textContent = data.message;
        bar.classList.remove('hidden');
      }
    } else {
      lastMsg = '';
      bar.classList.add('hidden');
    }
  }
  function announceInit() {
    if (!online()) return;
    announceCheck();
    setInterval(announceCheck, 30000);
  }

  return {
    renderQAPanel, qaInit, qaSubmit, qaUpvote,
    renderPollPanel, pollInit, vote,
    renderLFPanel, lfInit, lfSetType, lfFilter, lfSubmit, lfResolve,
    announceInit,
  };
})();
