# KSA 2026 — Live Conference Programme

Live scientific programme for the **33rd Kenya Society of Anaesthesiologists Annual
Scientific Conference**, Sarova Whitesands Beach Resort & Spa, Mombasa,
**19–21 August 2026**.

Static site — no build step, no framework, no server. Works offline once loaded.

## What it does

| Feature | Notes |
|---|---|
| **Day tabs** | Pre-Conference (Wed 19), Day 1 (Thu 20), Day 2 (Fri 21) |
| **Parallel tracks** | Side-by-side track columns with chairs, room and speakers |
| **Live now/next bar** | Highlights the running session with a countdown; falls back to "next up" |
| **Auto-jump to today** | Opens on the current conference day, Mombasa time (EAT) |
| **Search** | Full-text across titles, speakers, tracks and rooms — all three days at once |
| **My Schedule** | Star sessions to build a personal programme; flags time clashes. Device-local |
| **Faculty** | Auto-generated index of every speaker and session chair in the programme |
| **Ask** | Delegates submit and upvote questions for the chair |
| **Live Poll** | Poll opened from a spreadsheet, results update every 20 s |
| **Lost & Found** | Post and resolve lost/found items |
| **Announcements** | Organiser types a message in a sheet → banner on every screen within 30 s |

All timing logic runs on `Africa/Nairobi`, so the live bar is correct regardless of
the delegate's device timezone.

## Structure

```
index.html         page shell
css/styles.css     all styling
js/config.js       ← the only file you edit to go live (Apps Script URL)
js/program.js      the full programme, transcribed from 2026ksa.xlsx
js/app.js          rendering, search, My Schedule, live bar
js/live.js         Q&A / polls / lost & found / announcements
appscript.gs       Google Apps Script backend (paste into a Google Sheet)
```

To change the programme, edit `js/program.js` only — everything else is derived
(faculty index, search index, Q&A session dropdown, live bar).

## Deploy to GitHub Pages

```bash
gh repo create ksa2026 --public --source=. --remote=origin --push
```

or manually:

```bash
git remote add origin https://github.com/<user>/ksa2026.git
git push -u origin main
```

Then in **Settings → Pages**, set **Source: GitHub Actions**. The included
workflow (`.github/workflows/pages.yml`) publishes on every push to `main`.

Site URL: `https://<user>.github.io/ksa2026/`

> Prefer no workflow? Set **Source: Deploy from a branch → main / (root)** instead.
> The `.nojekyll` file is already present so folders work correctly.

## Turning on the live features

The Ask / Live Poll / Lost & Found tabs run in **offline demo mode** until you
connect a backend — posts stay on the delegate's own device, and the tabs say so.

1. Create a Google Sheet, e.g. *KSA 2026 Live*.
2. **Extensions → Apps Script**, replace `Code.gs` with `appscript.gs`, save.
3. **Deploy → New deployment → Web app** — *Execute as: Me*, *Who has access: Anyone*.
4. Copy the `/exec` URL into `js/config.js`:
   ```js
   const GS_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
   ```
5. Commit and push. The tabs go live immediately.

Sheets (`QA`, `Polls`, `Votes`, `LostFound`, `Announcements`) are created on first use.

### Running it during the conference

- **Open a poll** — add a row to `Polls`: `id | question | ["Yes","No","Unsure"] | TRUE`.
  Set `active` to `FALSE` to close it.
- **Triage questions** — sort the `QA` sheet by upvotes; the chair reads from the top.
- **Announce something** — type into `Announcements`, set `active` to `TRUE`.
  Set it back to `FALSE` to clear the banner.

## Programme source

Transcribed from `2026ksa.xlsx`. Times are unchanged from the spreadsheet;
obvious spelling slips were corrected and titles set in sentence case.

Two inconsistencies in the source spreadsheet were carried over as-is rather than
silently altered — see the notes in the handover for Day 2 afternoon
(panel 15:00–15:40 vs discussion 15:15–15:30 vs tea 15:30) and the
Pre-Conference 10:10–10:45 tea break against the 10:40 workshop restart.
