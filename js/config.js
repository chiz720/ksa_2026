/* ==========================================================================
   KSA 2026 — deployment configuration
   --------------------------------------------------------------------------
   GS_URL is the Google Apps Script Web-App URL that backs the three
   interactive tabs (Ask / Live Poll / Lost & Found) and the announcement bar.

   To switch them on:
     1. Create a new Google Sheet (e.g. "KSA 2026 Live").
     2. Extensions → Apps Script → paste the contents of appscript.gs → Save.
     3. Deploy → New deployment → type "Web app"
          Execute as:      Me
          Who has access:  Anyone
     4. Copy the /exec URL and paste it below, then commit + push.

   Leave it as an empty string and the three tabs run in offline demo mode
   (this device only) — everything else on the site works normally.
   ========================================================================== */

const GS_URL = 'https://script.google.com/macros/s/AKfycbzPcWtVJBCneqxe6qTtpRbs2-ZewQOb8T01K3kkH0TgqCYF723wSvBArYSxCh9gDF8V/exec';
