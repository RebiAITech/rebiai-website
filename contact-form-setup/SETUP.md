# Contact Form → Google Sheet — Setup

The website is a static site (GitHub Pages, no backend). The contact form sends
submissions to a **Google Apps Script Web App**, which appends each one as a row
in a Google Sheet. One-time setup, ~5 minutes.

## 1. Create the Google Sheet
1. Go to <https://sheets.google.com> and create a new blank spreadsheet.
2. Name it e.g. **ReBi AI — Contact Submissions**. (You don't need to add
   headers or a tab named `Contacts`; the script creates them on first submit.)

## 2. Add the Apps Script
1. In the sheet menu: **Extensions → Apps Script**.
2. Delete any boilerplate in `Code.gs`.
3. Paste the entire contents of [`Code.gs`](./Code.gs) from this folder.
4. Click the **Save** (💾) icon.

## 3. Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear ⚙ next to "Select type" → choose **Web app**.
3. Configure:
   - **Description:** `Contact form endpoint`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**  ← required so the website can post to it
4. Click **Deploy**.
5. Click **Authorize access** and approve the permission prompt
   (Google may warn "unverified app" → **Advanced → Go to … (unsafe)** → Allow.
   This is normal for your own scripts.)
6. Copy the **Web app URL** — it ends with `/exec`.

## 4. Connect the website
1. Open `index.html`.
2. Find this line (near the bottom, in the contact-form script):
   ```js
   const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
   ```
3. Replace the placeholder URL with the **Web app URL** you copied.
4. Commit and push — GitHub Pages redeploys automatically.

## 5. Test
- Submit the form on the live site.
- A new row should appear in the sheet's **Contacts** tab within a second or two.
- You can also visit the `/exec` URL directly in a browser — it returns
  `{"result":"ok",...}` to confirm the endpoint is live.

## Updating the script later
If you edit `Code.gs`, redeploy: **Deploy → Manage deployments → ✏️ Edit →
Version: New version → Deploy**. The `/exec` URL stays the same, so you don't
need to touch `index.html` again.

## Notes
- The frontend uses `fetch(..., { mode: 'no-cors' })` because Apps Script web
  apps don't return CORS headers. The request still reaches the script and the
  row is written; the browser just can't read the response body, so the UI
  shows success optimistically once the request completes.
- To get email alerts on each submission, add a `MailApp.sendEmail(...)` call
  inside `doPost` in `Code.gs`.
