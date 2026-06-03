import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../api/auth/jwt-config.js";
import { users, usersById } from "../api/auth/signup.js";
import { registrations, scanLogs } from "../api/db/store.js";

import registerHandler from "../api/events/[id]/register.js";
import tokenHandler from "../api/tickets/token.js";
import validateHandler from "../api/tickets/validate.js";
import checkinHandler from "../api/tickets/checkin.js";
import checkinsHandler from "../api/tickets/checkins.js";
import statsHandler from "../api/tickets/stats.js";

// Helper: Create a Mock Response
const createResponse = () => {
  const headers = {};
  const response = {
    statusCode: 200,
    body: null,
    headers,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(key, value) {
      if (typeof key === "object") {
        Object.assign(this.headers, key);
      } else {
        this.headers[key] = value;
      }
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
  return response;
};

// Helper: Create a Mock Request with optional Bearer JWT Token
const createRequest = (method, { body = {}, query = {}, user = null } = {}) => {
  const headers = {};
  if (user) {
    const token = jwt.sign(user, getJwtSecret());
    headers.authorization = `Bearer ${token}`;
  }
  return {
    method,
    body,
    query,
    headers,
  };
};

// Seed Mock Users
const organizerUser = {
  id: "user-organizer-1",
  email: "organizer@eventra.com",
  roles: ["ORGANIZER"],
  fullName: "Event Organizer",
};

const attendeeUser = {
  id: "user-attendee-1",
  email: "attendee@eventra.com",
  roles: ["USER"],
  fullName: "John Doe",
};

const otherAttendeeUser = {
  id: "user-attendee-2",
  email: "other@eventra.com",
  roles: ["USER"],
  fullName: "Jane Smith",
};

// Register them in the in-memory users tables
users.set(organizerUser.email.toLowerCase(), organizerUser);
usersById.set(organizerUser.id, organizerUser);

users.set(attendeeUser.email.toLowerCase(), attendeeUser);
usersById.set(attendeeUser.id, attendeeUser);

users.set(otherAttendeeUser.email.toLowerCase(), otherAttendeeUser);
usersById.set(otherAttendeeUser.id, otherAttendeeUser);

const eventId = 12345;

console.log("Running Event Attendance and QR Check-in integration tests...");

// Reset Store Helper
const resetStore = () => {
  registrations.clear();
  scanLogs.length = 0;
};

// Test 1: Event Registration produces a secure JWT Ticket Token
{
  resetStore();
  const req = createRequest("POST", {
    body: {
      fullName: attendeeUser.fullName,
      email: attendeeUser.email,
      phone: "+1234567890",
      organization: "Google Devs",
      designation: "Software Engineer",
      additionalInfo: "Vegetarian food request",
    },
    query: { id: String(eventId) },
    user: attendeeUser,
  });
  const res = createResponse();
  await registerHandler(req, res);

  assert.equal(res.statusCode, 201, "Registration should succeed and return 201");
  assert.ok(res.body.registrationId, "Response must include a registrationId");
  assert.ok(res.body.qrToken, "Response must include a qrToken");

  // Verify token contents
  const decoded = jwt.verify(res.body.qrToken, getJwtSecret());
  assert.equal(decoded.registrationId, res.body.registrationId, "Token payload registrationId must match response");
  assert.equal(decoded.eventId, eventId, "Token payload eventId must match registration");
  assert.equal(decoded.userId, attendeeUser.id, "Token payload userId must match attendee");
  assert.equal(decoded.userName, undefined, "Token must not leak sensitive fields like userName");
  assert.equal(decoded.email, undefined, "Token must not leak sensitive fields like email");

  console.log("✔ Test 1 passed: Event Registration produces a secure JWT Ticket Token");
}

// Test 2: Token Endpoint fetches & recovers dynamic ticket token
{
  resetStore();
  // Directly seed a legacy registration (without qrToken) to test recovery
  const regId = "reg-legacy-123";
  const legacyReg = {
    registrationId: regId,
    eventId: eventId,
    userId: attendeeUser.id,
    userName: attendeeUser.fullName,
    email: attendeeUser.email,
    registeredAt: new Date().toISOString(),
    attendanceStatus: "Registered",
  };
  registrations.set(regId, legacyReg);

  const req = createRequest("POST", {
    body: { registrationId: regId, eventId: eventId },
    user: attendeeUser,
  });
  const res = createResponse();
  await tokenHandler(req, res);

  assert.equal(res.statusCode, 200, "Token endpoint should return 200");
  assert.ok(res.body.token, "Should successfully generate a token");
  assert.equal(res.body.registrationId, regId);

  // Check registration object has token saved
  const updatedReg = registrations.get(regId);
  assert.equal(updatedReg.qrToken, res.body.token, "Stored registration should be updated with the token");

  console.log("✔ Test 2 passed: Token Endpoint fetches & recovers dynamic ticket token");
}

// Test 3: Unauthorized Access Denied for token endpoint
{
  resetStore();
  const regId = "reg-test-123";
  registrations.set(regId, {
    registrationId: regId,
    eventId: eventId,
    userId: attendeeUser.id,
    userName: attendeeUser.fullName,
    email: attendeeUser.email,
    attendanceStatus: "Registered",
  });

  // Attempt to read attendeeUser's ticket using otherAttendeeUser's credentials
  const req = createRequest("POST", {
    body: { registrationId: regId, eventId: eventId },
    user: otherAttendeeUser,
  });
  const res = createResponse();
  await tokenHandler(req, res);

  assert.equal(res.statusCode, 403, "Reading other users' ticket should be Forbidden (403)");
  console.log("✔ Test 3 passed: Unauthorized Access Denied for token endpoint");
}

// Test 4: Verify check-in flow (validate -> checkin)
{
  resetStore();
  // Register attendee first
  const regReq = createRequest("POST", {
    body: { fullName: attendeeUser.fullName, email: attendeeUser.email },
    query: { id: String(eventId) },
    user: attendeeUser,
  });
  const regRes = createResponse();
  await registerHandler(regReq, regRes);
  const token = regRes.body.qrToken;

  // Step 4.1: Validate ticket as organizer
  const valReq = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: organizerUser,
  });
  const valRes = createResponse();
  await validateHandler(valReq, valRes);

  assert.equal(valRes.statusCode, 200, "Ticket validation should succeed (200)");
  assert.equal(valRes.body.valid, true, "Ticket must be marked valid");
  assert.equal(valRes.body.alreadyCheckedIn, false, "Ticket must not be already checked in");
  assert.equal(valRes.body.userName, attendeeUser.fullName, "Validate response should return user's name");

  // Step 4.2: Record check-in as organizer
  const cinReq = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: organizerUser,
  });
  const cinRes = createResponse();
  await checkinHandler(cinReq, cinRes);

  assert.equal(cinRes.statusCode, 200, "Attendee check-in should succeed (200)");
  assert.equal(cinRes.body.success, true);
  assert.equal(cinRes.body.registration.attendanceStatus, "Checked In", "Status should update to Checked In");
  assert.ok(cinRes.body.registration.checkedInAt, "checkedInAt timestamp should be set");
  assert.equal(cinRes.body.registration.checkedInBy, organizerUser.id, "checkedInBy should record organizer ID");

  console.log("✔ Test 4 passed: Verify check-in flow (validate -> checkin)");
}

// Test 5: Prevent duplicate check-in & record audit log
{
  resetStore();
  // Register and check-in attendee
  const regReq = createRequest("POST", {
    body: { fullName: attendeeUser.fullName, email: attendeeUser.email },
    query: { id: String(eventId) },
    user: attendeeUser,
  });
  const regRes = createResponse();
  await registerHandler(regReq, regRes);
  const token = regRes.body.qrToken;

  // Perform first check-in
  const cinReq1 = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: organizerUser,
  });
  const cinRes1 = createResponse();
  await checkinHandler(cinReq1, cinRes1);
  assert.equal(cinRes1.statusCode, 200);

  // Step 5.1: Try validating again
  const valReq2 = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: organizerUser,
  });
  const valRes2 = createResponse();
  await validateHandler(valReq2, valRes2);
  assert.equal(valRes2.statusCode, 200);
  assert.equal(valRes2.body.valid, true);
  assert.equal(valRes2.body.alreadyCheckedIn, true, "Validation should flag ticket as already checked in");

  // Step 5.2: Try checking in again
  const cinReq2 = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: organizerUser,
  });
  const cinRes2 = createResponse();
  await checkinHandler(cinReq2, cinRes2);

  assert.equal(cinRes2.statusCode, 409, "Duplicate check-in should return 409 Conflict");
  
  // Step 5.3: Verify audit logs
  assert.equal(scanLogs.length, 3, "There should be three scan logs (1 successful, 2 duplicate attempts)");
  assert.equal(scanLogs[0].status, "Checked In");
  assert.equal(scanLogs[1].status, "Duplicate Attempt");
  assert.equal(scanLogs[2].status, "Duplicate Attempt");

  console.log("✔ Test 5 passed: Prevent duplicate check-in & record audit log");
}

// Test 6: Security and event matching validations
{
  resetStore();
  const regReq = createRequest("POST", {
    body: { fullName: attendeeUser.fullName, email: attendeeUser.email },
    query: { id: String(eventId) },
    user: attendeeUser,
  });
  const regRes = createResponse();
  await registerHandler(regReq, regRes);
  const token = regRes.body.qrToken;

  // Validate with a different event ID
  const wrongEventId = 99999;
  const valReq = createRequest("POST", {
    body: { ticketId: token, eventId: wrongEventId },
    user: organizerUser,
  });
  const valRes = createResponse();
  await validateHandler(valReq, valRes);

  assert.equal(valRes.statusCode, 400, "Should reject event mismatch with status 400");
  assert.equal(valRes.body.valid, false);
  assert.ok(valRes.body.message.includes("different event"), "Error message should mention event mismatch");

  console.log("✔ Test 6 passed: Security and event matching validations");
}

// Test 7: Non-organizer role block (403 Forbidden)
{
  resetStore();
  const regReq = createRequest("POST", {
    body: { fullName: attendeeUser.fullName, email: attendeeUser.email },
    query: { id: String(eventId) },
    user: attendeeUser,
  });
  const regRes = createResponse();
  await registerHandler(regReq, regRes);
  const token = regRes.body.qrToken;

  // Try to validate ticket using standard attendee credentials (non-organizer)
  const valReq = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: attendeeUser,
  });
  const valRes = createResponse();
  await validateHandler(valReq, valRes);

  assert.equal(valRes.statusCode, 403, "Non-organizer should be forbidden from validation");
  
  // Try to check in ticket using standard attendee credentials
  const cinReq = createRequest("POST", {
    body: { ticketId: token, eventId: eventId },
    user: attendeeUser,
  });
  const cinRes = createResponse();
  await checkinHandler(cinReq, cinRes);

  assert.equal(cinRes.statusCode, 403, "Non-organizer should be forbidden from checking in attendees");

  console.log("✔ Test 7 passed: Non-organizer role block (403 Forbidden)");
}

// Test 8: Check-in History Log retrieve
{
  resetStore();
  
  // Seed some logs manually to check filter
  scanLogs.push(
    { logId: "log-1", registrationId: "reg-1", eventId: eventId, userId: "u-1", userName: "Alice", scannedBy: organizerUser.id, timestamp: new Date().toISOString(), status: "Checked In" },
    { logId: "log-2", registrationId: "reg-2", eventId: 9999, userId: "u-2", userName: "Bob", scannedBy: organizerUser.id, timestamp: new Date().toISOString(), status: "Checked In" }
  );

  // Fetch all logs
  const reqAll = createRequest("GET", { query: {}, user: organizerUser });
  const resAll = createResponse();
  await checkinsHandler(reqAll, resAll);

  assert.equal(resAll.statusCode, 200);
  assert.equal(resAll.body.length, 2, "Should return all logs");

  // Fetch logs filtered by eventId
  const reqEvent = createRequest("GET", { query: { eventId: String(eventId) }, user: organizerUser });
  const resEvent = createResponse();
  await checkinsHandler(reqEvent, resEvent);

  assert.equal(resEvent.statusCode, 200);
  assert.equal(resEvent.body.length, 1, "Should filter logs by eventId");
  assert.equal(resEvent.body[0].name, "Alice");

  console.log("✔ Test 8 passed: Check-in History Log retrieve");
}

// Test 9: Aggregated Statistics Calculations
{
  resetStore();

  // Seed 4 registrations for eventId: 3 registered, 1 checked-in, 1 cancelled (ignored)
  registrations.set("reg-s1", { registrationId: "reg-s1", eventId, userId: "u-s1", userName: "Alice", attendanceStatus: "Registered" });
  registrations.set("reg-s2", { registrationId: "reg-s2", eventId, userId: "u-s2", userName: "Bob", attendanceStatus: "Registered" });
  registrations.set("reg-s3", { registrationId: "reg-s3", eventId, userId: "u-s3", userName: "Charlie", attendanceStatus: "Checked In" });
  registrations.set("reg-s4", { registrationId: "reg-s4", eventId, userId: "u-s4", userName: "Dave", attendanceStatus: "Cancelled" });

  const req = createRequest("GET", { query: { eventId: String(eventId) }, user: organizerUser });
  const res = createResponse();
  await statsHandler(req, res);

  assert.equal(res.statusCode, 200);
  // Registered for eventId should be 3 (ignoring Cancelled)
  assert.equal(res.body.totalRegistrations, 3);
  assert.equal(res.body.checkedInAttendees, 1);
  assert.equal(res.body.remainingAttendees, 2);
  assert.equal(res.body.attendancePercentage, 33); // 1 / 3 = 33%

  console.log("✔ Test 9 passed: Aggregated Statistics Calculations");
}

console.log("All QR attendance check-in integration tests passed successfully!");
