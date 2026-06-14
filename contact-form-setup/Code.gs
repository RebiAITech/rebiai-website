/**
 * ReBi AI — Contact form → Google Sheet
 *
 * Receives a POST from the website contact form and appends a row to the
 * bound Google Sheet. Deploy this as a Web App (see SETUP.md).
 */

// Column order: { key } matches the JSON sent by the form,
// { label } is the human-readable header written to row 1.
const COLUMNS = [
  { key: 'firstName',    label: 'First Name' },
  { key: 'lastName',     label: 'Last Name' },
  { key: 'email',        label: 'Email' },
  { key: 'company',      label: 'Company' },
  { key: 'inquiryType',  label: 'Inquiry Type' },
  { key: 'message',      label: 'Message' },
  { key: 'pageUrl',      label: 'Page URL' },
  { key: 'submittedAt',  label: 'Submitted At' },
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid concurrent-write race conditions

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts')
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Contacts');

    // Write header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(col => col.label));
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const data = JSON.parse(e.postData.contents || '{}');
    const row = COLUMNS.map(col => {
      if (col.key === 'submittedAt') {
        return data.submittedAt || new Date().toISOString();
      }
      return data[col.key] || '';
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
