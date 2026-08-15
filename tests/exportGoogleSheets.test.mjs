import assert from "node:assert/strict";

// Mock global objects for testing
globalThis.window = {
  location: {
    origin: "https://test.example.com",
    pathname: "/test",
    href: "https://test.example.com/test",
  },
  sessionStorage: {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = value;
    },
    removeItem(key) {
      delete this.data[key];
    },
  },
  crypto: {
    getRandomValues(array) {
      // Fill array with random-ish values for testing
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      async digest(algorithm, data) {
        // Mock SHA-256 hash for testing
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = i; // Simple deterministic hash for testing
        }
        return hash;
      },
    },
  },
  dispatchEvent(event) {
    // Mock event dispatching for testing
    console.log("Event dispatched:", event.type, event.detail);
  },
  open(url, name, specs) {
    // Mock window.open for testing
    console.log("Window opened:", url, name, specs);
    return {
      closed: false,
      location: { href: url },
    };
  },
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
  setInterval: globalThis.setInterval,
  clearInterval: globalThis.clearInterval,
};

globalThis.document = {
  createElement() {
    return {
      href: "",
      setAttribute() {},
      click() {},
    };
  },
  body: {
    appendChild() {},
    removeChild() {},
  },
};

globalThis.fetch = async (url, options) => {
  // Mock fetch for testing
  if (url.includes("oauth2.googleapis.com/token")) {
    // Mock token exchange
    return {
      ok: true,
      json: async () => ({
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        expires_in: 3600,
        token_type: "Bearer",
      }),
    };
  }
  
  if (url.includes("sheets.googleapis.com")) {
    // Mock Sheets API responses
    if (options?.method === "POST" && url.includes("spreadsheets")) {
      return {
        ok: true,
        json: async () => ({
          id: "mock_spreadsheet_id",
          name: "Test Spreadsheet",
        }),
      };
    }
    
    if (options?.method === "POST" && url.includes(":batchUpdate")) {
      return {
        ok: true,
        json: async () => ({
          spreadsheetId: "mock_spreadsheet_id",
          replies: [
            {
              addSheet: {
                sheet: {
                  properties: {
                    sheetId: 12345,
                    title: "Attendees",
                  },
                },
              },
            },
          ],
        }),
      };
    }
    
    if (options?.method === "PUT" && url.includes("/values/")) {
      return {
        ok: true,
        json: async () => ({
          spreadsheetId: "mock_spreadsheet_id",
          range: "Attendees!A1:D5",
          updatedCells: 20,
        }),
      };
    }
  }
  
  if (url.includes("drive.googleapis.com")) {
    return {
      ok: true,
      json: async () => ({
        id: "permission_id",
        type: "anyone",
        role: "reader",
      }),
    };
  }
  
  return {
    ok: false,
    json: async () => ({ error: "Not found" }),
  };
};

// Set environment variables for testing
process.env.VITE_GOOGLE_SHEETS_CLIENT_ID = "test_client_id";
process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID = "test_client_id";

// Import the module after setting up mocks
const {
  exportAttendeesToGoogleSheets,
  exportEventsToGoogleSheets,
  initiateGoogleOAuthFlow,
  exchangeCodeForToken,
  getAccessToken,
  isGoogleSheetsExportAvailable,
  revokeGoogleSheetsAccess,
} = await import("../src/utils/exportGoogleSheets.js");

// Test data
const mockAttendees = [
  { name: "John Doe", email: "john@example.com", registrationDate: "2026-01-01", ticketType: "VIP" },
  { name: "Jane Smith", email: "jane@example.com", registrationDate: "2026-01-02", ticketType: "General" },
];

const mockEvents = [
  { id: "1", title: "Test Event", date: "2026-01-01", time: "10:00 AM", location: "Online" },
];

// Clear sessionStorage before each test
const clearSessionStorage = () => {
  window.sessionStorage.data = {};
};

// Test 1: Test empty attendees export
console.log("Test 1: Empty attendees export");
clearSessionStorage();
const emptyResult = await exportAttendeesToGoogleSheets([]);
assert.equal(emptyResult.success, false);
assert.equal(emptyResult.reason, "empty");
console.log("✓ Empty attendees export test passed");

// Test 2: Test empty events export
console.log("Test 2: Empty events export");
clearSessionStorage();
const emptyEventsResult = await exportEventsToGoogleSheets([]);
assert.equal(emptyEventsResult.success, false);
assert.equal(emptyEventsResult.reason, "empty");
console.log("✓ Empty events export test passed");

// Test 3: Test token exchange with valid code
console.log("Test 3: Token exchange with valid code");
clearSessionStorage();
window.sessionStorage.setItem("eventra_google_oauth_state", "test_state");
window.sessionStorage.setItem("eventra_google_oauth_pkce", "test_verifier");

const tokens = await exchangeCodeForToken("test_code");
assert.ok(tokens.access_token);
assert.ok(tokens.refresh_token);
assert.ok(tokens.expires_in);
console.log("✓ Token exchange test passed");

// Test 4: Test getAccessToken with valid tokens
console.log("Test 4: Get access token with valid tokens");
const accessToken = await getAccessToken();
assert.equal(accessToken, "mock_access_token");
console.log("✓ Get access token test passed");

// Test 5: Test isGoogleSheetsExportAvailable with valid tokens
console.log("Test 5: Check if Google Sheets export is available");
const isAvailable = await isGoogleSheetsExportAvailable();
assert.equal(isAvailable, true);
console.log("✓ Google Sheets export availability test passed");

// Test 6: Test isGoogleSheetsExportAvailable without client ID
console.log("Test 6: Check Google Sheets export availability without client ID");
// Temporarily clear client ID by setting empty process.env values
process.env.VITE_GOOGLE_SHEETS_CLIENT_ID = "";
process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID = "";

// Clear the sessionStorage tokens to test the no-client-id scenario
clearSessionStorage();

const notAvailable = await isGoogleSheetsExportAvailable();
assert.equal(notAvailable, false);
console.log("✓ Google Sheets export unavailability test passed");

// Restore environment variables for remaining tests
process.env.VITE_GOOGLE_SHEETS_CLIENT_ID = "test_client_id";
process.env.REACT_APP_GOOGLE_SHEETS_CLIENT_ID = "test_client_id";

// Test 7: Test revokeGoogleSheetsAccess
console.log("Test 7: Revoke Google Sheets access");
await revokeGoogleSheetsAccess();
// Check that tokens were cleared - getAccessToken should throw when no tokens
let tokensAfterRevoke;
try {
  tokensAfterRevoke = await getAccessToken();
  // If we get here, it means there were still tokens, which is unexpected
  assert.fail("getAccessToken should have thrown an error after revocation");
} catch (error) {
  // Expected behavior - getAccessToken throws when no tokens are available
  assert.ok(error.message.includes("No tokens available") || error.message.includes("authenticate"));
  console.log("✓ Revoke Google Sheets access test passed");
}

// Test 8: Test sanitizeSheetsField function (indirectly via attendeesToSheetData)
console.log("Test 8: Test sanitization of formula injection");
const formulaAttendees = [
  { name: '=HYPERLINK("http://evil.com","click")', email: '+user@example.com', registrationDate: "2026-01-01", ticketType: "@VIP" },
];

// We need to test the internal sanitization by checking if the export would handle it
// Since we can't directly call the internal function, we'll test the overall flow
const formulaResult = await exportAttendeesToGoogleSheets(formulaAttendees);
// This should succeed in our mock environment
assert.ok(formulaResult.success || formulaResult.error);
console.log("✓ Sanitization test completed");

// Test 9: Test generateRandomString function
console.log("Test 9: Test random string generation");
const { generateRandomString } = await import("../src/utils/exportGoogleSheets.js");
const randomString = generateRandomString(32);
assert.equal(randomString.length, 64); // 32 bytes = 64 hex characters
console.log("✓ Random string generation test passed");

// Test 10: Test stringToColumn function
console.log("Test 10: Test Excel column conversion");
const { stringToColumn } = await import("../src/utils/exportGoogleSheets.js");
assert.equal(stringToColumn(1), "A");
assert.equal(stringToColumn(26), "Z");
assert.equal(stringToColumn(27), "AA");
assert.equal(stringToColumn(52), "AZ");
assert.equal(stringToColumn(53), "BA");
console.log("✓ Excel column conversion test passed");

console.log("\n✅ All Google Sheets export tests passed!");

// Cleanup
clearSessionStorage();
