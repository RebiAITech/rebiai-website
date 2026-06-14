/**
 * ReBi AI — Contact form → Google Sheet
 *
 * Receives a POST from the website contact form and appends a row to the
 * bound Google Sheet. Deploy this as a Web App (see SETUP.md).
 */

// Header order written to row 1 (created automatically on first submit).
const HEADERS = [
  'submittedAt',
  'firstName',
  'lastName',
  'email',
  'company',
  'inquiryType',
  'message',
  'pageUrl',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid concurrent-write race conditions

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts')
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Contacts');

    // Write header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents || '{}');
    const row = HEADERS.map(key => {
      if (key === 'submittedAt') {
        return data.submittedAt || new Date().toISOString();
      }
      return data[key] || '';
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Optional: lets you open the /exec URL in a browser to confirm it's live.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', message: 'ReBi AI contact endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
