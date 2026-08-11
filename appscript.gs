/**
 * KSA 2026 — Live backend (Q&A · Polls · Lost & Found · Announcements)
 * Google Apps Script bound to a Google Sheet.
 *
 * SETUP
 *   1. Create a Google Sheet, e.g. "KSA 2026 Live".
 *   2. Extensions → Apps Script → replace Code.gs with this file → Save.
 *   3. Deploy → New deployment → Web app
 *        Execute as:     Me
 *        Who has access: Anyone
 *   4. Copy the /exec URL into js/config.js (GS_URL), commit and push.
 *
 * The four sheets below are created automatically on first use.
 *
 * RUNNING THE CONFERENCE
 *   Polls  — add a row: id | question | ["Option A","Option B"] | TRUE
 *            Set active to FALSE to close a poll.
 *   QA     — questions arrive automatically; sort by upvotes to triage.
 *   Announcements — type a message, set active TRUE; it appears on every
 *                   delegate's screen within 30 seconds. FALSE hides it.
 */

const SH_LF       = 'LostFound';
const SH_POLLS    = 'Polls';
const SH_VOTES    = 'Votes';
const SH_QA       = 'QA';
const SH_ANNOUNCE = 'Announcements';
const TZ          = 'Africa/Nairobi';

// ── Sheet bootstrapping ──────────────────────────────────────────────────────

function sheet_(name, headers, widths) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    (widths || []).forEach(function (w, i) { if (w) sh.setColumnWidth(i + 1, w); });
  }
  return sh;
}

const lfSheet_       = () => sheet_(SH_LF,    ['id','type','item','desc','loc','name','contact','resolved','timestamp'], [140,70,200,220,160,140,150,80,110]);
const pollsSheet_    = () => sheet_(SH_POLLS, ['id','question','options','active'], [120,340,280,70]);
const votesSheet_    = () => sheet_(SH_VOTES, ['poll_id','option_index','device_id','timestamp'], [120,110,200,110]);
const qaSheet_       = () => sheet_(SH_QA,    ['id','session','question','name','upvotes','timestamp'], [140,220,360,150,80,110]);

function announceSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SH_ANNOUNCE);
  if (!sh) {
    sh = sheet_(SH_ANNOUNCE, ['message','active'], [420, 80]);
    sh.appendRow(['Karibu Mombasa! Collect your badge at the registration desk.', 'FALSE']);
  }
  return sh;
}

// ── Reads ────────────────────────────────────────────────────────────────────

function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || 'lostfound';
  if (type === 'polls')        return getPolls_();
  if (type === 'qa')           return getQA_();
  if (type === 'announcement') return getAnnouncement_();
  return getLostFound_();
}

function getLostFound_() {
  const vals = lfSheet_().getDataRange().getValues();
  if (vals.length <= 1) return respond_([]);
  const rows = vals.slice(1).filter(r => r[0]).map(r => ({
    id: String(r[0]), type: r[1], item: r[2], desc: r[3], loc: r[4],
    name: r[5], contact: r[6],
    resolved: r[7] === true || String(r[7]).toUpperCase() === 'TRUE',
    ts: r[8],
  })).reverse();
  return respond_(rows);
}

function getQA_() {
  const vals = qaSheet_().getDataRange().getValues();
  if (vals.length <= 1) return respond_([]);
  const rows = vals.slice(1).filter(r => r[0]).map(r => ({
    id: String(r[0]), session: r[1], question: r[2],
    name: r[3] || 'Anonymous', upvotes: Number(r[4]) || 0, ts: r[5],
  })).sort((a, b) => b.upvotes - a.upvotes);
  return respond_(rows);
}

function getPolls_() {
  const pollVals = pollsSheet_().getDataRange().getValues();
  const voteVals = votesSheet_().getDataRange().getValues();

  const tally = {};
  voteVals.slice(1).forEach(r => {
    const pid = String(r[0]), opt = Number(r[1]);
    if (!tally[pid]) tally[pid] = {};
    tally[pid][opt] = (tally[pid][opt] || 0) + 1;
  });

  const polls = pollVals.slice(1)
    .filter(r => r[0] && (r[3] === true || String(r[3]).toUpperCase() === 'TRUE'))
    .map(r => {
      const id = String(r[0]);
      let options = [];
      try { options = JSON.parse(r[2]); }
      catch (err) { options = String(r[2]).split(',').map(s => s.trim()); }
      const t = tally[id] || {};
      const votes = options.map((_, i) => t[i] || 0);
      return { id, question: r[1], options, votes, total: votes.reduce((a, b) => a + b, 0) };
    });
  return respond_(polls);
}

function getAnnouncement_() {
  const vals = announceSheet_().getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][1] === true || String(vals[i][1]).toUpperCase() === 'TRUE') {
      return respond_({ active: true, message: String(vals[i][0]) });
    }
  }
  return respond_({ active: false });
}

// ── Writes ───────────────────────────────────────────────────────────────────

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const now  = () => Utilities.formatDate(new Date(), TZ, 'dd/MM HH:mm');

  if (data.action === 'resolve') {
    const sh = lfSheet_(), vals = sh.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) { sh.getRange(i + 1, 8).setValue(true); break; }
    }

  } else if (data.action === 'poll_vote') {
    const sh = votesSheet_(), vals = sh.getDataRange().getValues();
    const pid = String(data.poll_id), dev = String(data.device_id || '');
    const already = vals.slice(1).some(r => String(r[0]) === pid && String(r[2]) === dev);
    if (dev && !already) sh.appendRow([pid, Number(data.option_index), dev, now()]);

  } else if (data.action === 'qa_submit') {
    qaSheet_().appendRow([
      String(data.id || Date.now()), data.session || '', data.question || '',
      data.name || 'Anonymous', 0, now(),
    ]);

  } else if (data.action === 'qa_upvote') {
    const sh = qaSheet_(), vals = sh.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
      if (String(vals[i][0]) === String(data.id)) {
        sh.getRange(i + 1, 5).setValue((Number(vals[i][4]) || 0) + 1);
        break;
      }
    }

  } else {
    lfSheet_().appendRow([
      String(data.id || Date.now()), data.type || 'lost', data.item || '',
      data.desc || '', data.loc || '', data.name || '', data.contact || '',
      false, now(),
    ]);
  }

  return respond_({ ok: true });
}

function respond_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
