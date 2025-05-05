// Google Apps Script code should be:
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = e.parameter; 

    sheet.appendRow([
      data.Timestamp,
      data.ID,
      data["Full Name"],
      data.Email,
      data.Phone,
      data.Gender,
      data["Date of Birth"],
      data.Address,
      data.Password,
      data.Latitude,
      data.Longitude,
      data["User Agent"],
      data.Platform,
      data["Screen Resolution"],
    ]);

    return ContentService.createTextOutput("Success").setMimeType(
      ContentService.MimeType.TEXT
    );
  } catch (error) {
    return ContentService.createTextOutput(error.toString()).setMimeType(
      ContentService.MimeType.TEXT
    );
  }
}
