// CONFIGURATION
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
const SHEET_NAME = 'MediaLibrary';

// Google Photos API Base URL
const PHOTOS_API_ENDPOINT = 'https://photoslibrary.googleapis.com/v1/mediaItems';

/**
 * INIT: Setup the Google Sheet with headers
 */
function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Headers: ID, URL, MimeType, Title, Description, Tags, Category, Timestamp
  const headers = ['ID', 'BaseUrl', 'MimeType', 'Title', 'Description', 'Tags', 'Category', 'Timestamp', 'RawJson'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
}

/**
 * API: Serve data to frontend
 */
function doGet(e) {
  const params = e.parameter;
  const type = params.type || 'json';

  if (type === 'sync') {
    syncPhotos();
    return ContentService.createTextOutput(JSON.stringify({ status: 'Sync/Refresh complete' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (type === 'refresh') {
    refreshUrls();
    return ContentService.createTextOutput(JSON.stringify({ status: 'Refresh complete' })).setMimeType(ContentService.MimeType.JSON);
  }

  // Default: Return JSON data from Sheet
  const data = getSheetData();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

/**
 * CORE: Sync Photos from Google Photos -> Sheet + AI Analysis
 */
function syncPhotos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const existingIds = getExistingIds(sheet);

  // Fetch media items from Google Photos
  // Note: Standard limitation is 100 items per page. 
  // For production, you'd implement pagination 'nextPageToken'.
  const mediaItems = fetchGooglePhotos();

  const newRows = [];

  mediaItems.forEach(item => {
    if (existingIds.has(item.id)) return; // Skip existing

    // AI Analysis
    let aiMetadata = { title: '', description: '', tags: '', category: '' };
    try {
      if (item.mimeType.startsWith('image/')) {
        aiMetadata = callGeminiAnalysis(item.baseUrl);
      } else {
        // Fallback for videos or if AI fails
        aiMetadata.title = 'Video/Media ' + item.filename;
        aiMetadata.category = 'Video';
      }
    } catch (e) {
      console.error('AI Failed for ' + item.id, e);
    }

    newRows.push([
      item.id,
      item.baseUrl,
      item.mimeType,
      aiMetadata.title || item.filename,
      aiMetadata.description,
      aiMetadata.tags,
      aiMetadata.category,
      new Date(),
      JSON.stringify(item)
    ]);
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
  }
}

/**
 * CORE: Refresh Base URLs (They expire after 60 mins)
 */
function refreshUrls() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('ID');
  const urlIndex = headers.indexOf('BaseUrl');

  if (data.length <= 1) return;

  // We can batchGet media items to refresh URLs
  // The API supports up to 50 items per batchGet call
  const allIds = [];
  for (let i = 1; i < data.length; i++) {
    allIds.push(data[i][idIndex]);
  }

  // Process in chunks of 50
  const updatedUrlsMap = new Map();
  const CHUNK_SIZE = 50;

  for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
    const chunk = allIds.slice(i, i + CHUNK_SIZE);
    try {
      const refreshedItems = batchGetMediaItems(chunk);
      refreshedItems.forEach(item => {
        if (item && item.mediaItem) {
          updatedUrlsMap.set(item.mediaItem.id, item.mediaItem.baseUrl);
        }
      });
    } catch (e) {
      console.error('Batch refresh failed', e);
    }
  }

  // Update Sheet
  const updates = [];
  for (let i = 1; i < data.length; i++) {
    const id = data[i][idIndex];
    if (updatedUrlsMap.has(id)) {
      data[i][urlIndex] = updatedUrlsMap.get(id);
    }
  }

  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}


/**
 * HELPER: Call Gemini API
 * Note: Provide the image URL to Gemini Pro Vision
 */
function callGeminiAnalysis(imageUrl) {
  if (!GEMINI_API_KEY) return {};

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // We need to fetch the image bytes first because Gemini URL input 
  // often has issues with signed/complex URLs like Google Photos
  const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  const base64Image = Utilities.base64Encode(imageBlob.getBytes());
  const mimeType = imageBlob.getContentType();

  const payload = {
    contents: [{
      parts: [
        { text: "Analyze this image for a professional portfolio. Return a JSON object with these fields: 'title' (catchy, short), 'description' (professional, max 20 words), 'tags' (comma separated string of 5-7 keywords), 'category' (choose one: Event, Product, Portrait, Architecture, Nature, Other). Do not include markdown code blocks." },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const json = JSON.parse(response.getContentText());

  if (json.candidates && json.candidates[0] && json.candidates[0].content) {
    const text = json.candidates[0].content.parts[0].text;
    // CLEANUP: Remove markdown if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.warn('Failed to parse Gemini JSON', text);
      return { description: text };
    }
  }
  return {};
}

/**
 * HELPER: Fetch from Google Photos
 */
function fetchGooglePhotos(pageToken) {
  let url = PHOTOS_API_ENDPOINT + '?pageSize=50'; // Max 100
  if (pageToken) url += '&pageToken=' + pageToken;

  const token = ScriptApp.getOAuthToken();
  const options = {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  return data.mediaItems || [];
}

/**
 * HELPER: Batch Get (for refreshing URLs)
 */
function batchGetMediaItems(ids) {
  // https://photoslibrary.googleapis.com/v1/mediaItems:batchGet?mediaItemIds=...
  // Note: It's a GET request with query params repeated

  let url = 'https://photoslibrary.googleapis.com/v1/mediaItems:batchGet?';
  ids.forEach(id => {
    url += 'mediaItemIds=' + encodeURIComponent(id) + '&';
  });

  const token = ScriptApp.getOAuthToken();
  const options = {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  return data.mediaItemResults || []; // Returns list of { mediaItem: ... } or status
}

function getExistingIds(sheet) {
  const data = sheet.getDataRange().getValues();
  const ids = new Set();
  if (data.length <= 1) return ids;

  const idIndex = data[0].indexOf('ID');
  for (let i = 1; i < data.length; i++) {
    ids.add(data[i][idIndex]);
  }
  return ids;
}

function getSheetData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Auto-create the sheet with headers if it doesn't exist
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['ID', 'BaseUrl', 'MimeType', 'Title', 'Description', 'Tags', 'Category', 'Timestamp', 'RawJson'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    return []; // No data yet
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const results = [];

  for (let i = 1; i < data.length; i++) {
    let row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    results.push(row);
  }
  return results;
}
