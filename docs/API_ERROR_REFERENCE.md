# Comprehensive API Error Reference Guide

A detailed reference for understanding, handling, troubleshooting, testing, and recovering from API errors in Eventra.

## Table of Contents

1. Introduction
2. API Error Fundamentals
3. HTTP Status Code Classes
4. Successful Responses
5. Redirection Responses
6. Client Error Responses
7. Server Error Responses
8. Common API Failures
9. Authentication Errors
10. Authorization Errors
11. Validation Errors
12. Request Errors
13. Network Errors
14. CORS Errors
15. Timeout Errors
16. Rate Limiting
17. Error Response Structure
18. Error Handling Examples
19. Fetch Error Handling
20. API Client Error Handling
21. Troubleshooting Procedures
22. Recovery Recommendations
23. Retry Strategies
24. Logging Guidelines
25. Testing API Errors
26. Developer Checklist
27. Troubleshooting Checklist
28. API Error Reporting Template
29. Final Reference

---

# 1. Introduction

API errors are a normal part of application development.

An API request can fail because of:

* Invalid input
* Missing authentication
* Insufficient permissions
* Missing resources
* Network problems
* Server failures
* Rate limits
* Configuration problems
* Dependency failures
* Invalid API usage

Understanding the reason for a failure is necessary before selecting a recovery strategy.

This guide provides contributors with a common reference for API errors.

The guide covers:

* HTTP status codes
* Common API failures
* Authentication errors
* Authorization errors
* Validation errors
* Error handling
* Troubleshooting
* Recovery
* Retry behavior
* Testing
* Logging

---

# 2. API Error Fundamentals

An API response normally contains:

* HTTP status code
* Response headers
* Response body

Example:

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

The response body might contain:

```json
{
  "id": 101,
  "title": "Developer Conference"
}
```

An error response may contain:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields."
  }
}
```

The exact structure depends on the API.

Never assume that every error response uses the same JSON structure.

## Important Questions

When an API request fails, determine:

* What HTTP status was returned?
* What endpoint was requested?
* Which HTTP method was used?
* Was authentication included?
* Was authorization required?
* Was the request payload valid?
* Was the network available?
* Did the server return an error body?
* Is the error temporary?
* Is retrying safe?

---

# 3. HTTP Status Code Classes

HTTP status codes are grouped into five classes.

| Class | Range   | Description   |
| ----- | ------- | ------------- |
| 1xx   | 100-199 | Informational |
| 2xx   | 200-299 | Successful    |
| 3xx   | 300-399 | Redirection   |
| 4xx   | 400-499 | Client errors |
| 5xx   | 500-599 | Server errors |

The status code is the first piece of information developers should inspect when diagnosing an HTTP failure.

---

# 4. Successful Responses

## 200 OK

The request completed successfully.

Typical uses include:

* Fetching events
* Fetching registrations
* Updating event information
* Retrieving user information

Example:

```json
{
  "id": 100,
  "title": "Open Source Conference"
}
```

### Troubleshooting Unexpected 200 Responses

If the status is `200` but the result is unexpected:

* Check request parameters.
* Check filters.
* Check authentication context.
* Check response parsing.
* Check application state.
* Check caching.
* Check API documentation.

---

## 201 Created

The request successfully created a resource.

Typical uses:

* Creating an event
* Creating a registration
* Creating a speaker profile
* Creating feedback

Example:

```json
{
  "id": 500,
  "message": "Event created successfully"
}
```

### Troubleshooting

If the created resource does not appear:

* Check the returned resource ID.
* Refresh the resource list.
* Check application state.
* Check cache behavior.
* Confirm the creation request succeeded.

---

## 202 Accepted

The request was accepted but processing may continue asynchronously.

Typical uses include:

* Background processing
* Large operations
* Asynchronous jobs

### Troubleshooting

* Check whether a job status endpoint exists.
* Avoid submitting duplicate requests.
* Wait for documented processing time.
* Check job status if available.

---

## 204 No Content

The request succeeded without returning a response body.

Typical uses include:

* Deletion
* Successful updates
* Logout operations

Example:

```javascript
if (response.status === 204) {
  return;
}
```

Do not attempt to parse an empty response body as JSON.

---

# 5. Redirection Responses

## 301 Moved Permanently

The requested resource has permanently moved.

Check:

* Endpoint URL
* API documentation
* Deprecated routes
* Redirect configuration

---

## 302 Found

The resource is temporarily available at another location.

Authentication-related redirects should be reviewed carefully.

---

## 304 Not Modified

The resource has not changed and cached information may be reused.

If the UI displays stale information:

* Check cache headers.
* Refresh the resource.
* Check application caching.
* Check invalidation behavior.

---

# 6. Client Error Responses

4xx responses generally indicate that the request needs correction or that the client is not permitted to perform the operation.

---

## 400 Bad Request

The server could not understand or process the request.

Common causes:

* Invalid JSON
* Missing required parameters
* Incorrect parameter types
* Invalid request structure
* Malformed data

Example:

```http
POST /api/events
Content-Type: application/json
```

```json
{
  "title":
}
```

The malformed request may result in a `400`.

### Recovery

1. Inspect the request.
2. Validate the JSON.
3. Check required fields.
4. Check field names.
5. Check data types.
6. Correct the request.
7. Submit again.

Do not repeatedly retry the unchanged request.

---

## 401 Unauthorized

A `401` response indicates that authentication is missing or invalid.

Common causes:

* Missing authentication
* Expired token
* Invalid token
* Expired session
* Missing authentication cookie

### Recovery

1. Check whether the user is logged in.
2. Check authentication state.
3. Refresh authentication if supported.
4. Ask the user to sign in again if necessary.
5. Retry only after authentication succeeds.

### Frontend Handling

```javascript
if (response.status === 401) {
  clearAuthenticationState();
  redirectToLogin();
}
```

The exact behavior should follow the application's authentication architecture.

---

## 403 Forbidden

The server understood the request but refuses to authorize it.

Common causes:

* Insufficient permissions
* Wrong role
* Resource ownership restriction
* Administrator-only operation

### Recovery

* Check user permissions.
* Check user role.
* Check resource ownership.
* Verify that the requested operation is allowed.

Do not attempt to bypass a `403` by modifying frontend controls.

---

## 404 Not Found

The requested resource could not be found.

Possible causes:

* Incorrect URL
* Incorrect ID
* Deleted resource
* Incorrect API version
* Wrong environment

### Recovery

1. Verify the endpoint.
2. Verify the resource ID.
3. Confirm the resource exists.
4. Check the API version.
5. Check the environment.
6. Refresh application state.

---

## 405 Method Not Allowed

The endpoint exists but does not support the HTTP method used.

For example:

```text
DELETE /api/events/123
```

may fail if the endpoint only supports:

```text
GET
POST
```

### Recovery

* Check API documentation.
* Check the HTTP method.
* Check route definitions.
* Confirm the supported operation.

---

## 408 Request Timeout

The server did not receive the request within the expected time.

Possible causes:

* Slow network
* Network interruption
* Server overload
* Proxy timeout

### Recovery

* Check network connectivity.
* Check server status.
* Retry carefully.
* Avoid rapid repeated requests.

---

## 409 Conflict

The request conflicts with the current resource state.

Examples:

* Duplicate registration
* Event already cancelled
* Resource already exists
* Concurrent update
* Invalid state transition

### Recovery

1. Retrieve the latest resource state.
2. Determine the conflict.
3. Update the requested operation.
4. Retry only if appropriate.

---

## 410 Gone

The resource is no longer available and may have been intentionally removed.

### Recovery

* Stop requesting the old resource.
* Check whether a replacement exists.
* Update the application to use the current resource.

---

## 413 Content Too Large

The request exceeds the server's size limit.

Possible causes:

* Large file upload
* Large JSON request
* Oversized form submission

### Recovery

* Reduce request size.
* Compress data when appropriate.
* Split large operations.
* Use the documented upload mechanism.

---

## 415 Unsupported Media Type

The server does not support the request's media type.

Example:

```http
Content-Type: text/plain
```

when JSON is expected:

```http
Content-Type: application/json
```

### Recovery

* Check `Content-Type`.
* Check request body format.
* Review API documentation.
* Correct the request.

---

## 422 Unprocessable Content

The request is syntactically valid but contains invalid values.

Examples:

* Invalid email
* Invalid date
* Invalid capacity
* Invalid event state

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "capacity",
        "message": "Capacity must be greater than zero."
      }
    ]
  }
}
```

### Recovery

* Parse validation details.
* Identify invalid fields.
* Display useful field-level errors.
* Correct the values.
* Submit again.

---

## 423 Locked

The resource may currently be locked and unavailable for the requested operation.

### Recovery

* Check resource state.
* Wait if the lock is temporary.
* Avoid repeatedly submitting the same request.

---

## 429 Too Many Requests

The client has exceeded a request rate limit.

Common causes:

* Aggressive polling
* Retry loops
* Excessive API calls
* Many requests in a short period

### Recovery

1. Stop unnecessary requests.
2. Check rate-limit headers.
3. Check `Retry-After`.
4. Wait.
5. Retry using backoff.
6. Reduce request frequency.

---

# 7. Server Error Responses

5xx responses generally indicate that the server could not successfully complete an otherwise acceptable request.

---

## 500 Internal Server Error

The server encountered an unexpected condition.

Possible causes:

* Application bug
* Database failure
* Configuration error
* Unexpected backend condition
* Internal dependency failure

### Client Recovery

* Display a safe message.
* Avoid exposing server details.
* Retry only when appropriate.
* Report persistent failures.

Example:

```javascript
if (response.status >= 500) {
  showMessage("The service is temporarily unavailable.");
}
```

---

## 501 Not Implemented

The server does not support the functionality required to fulfill the request.

### Recovery

* Verify API documentation.
* Confirm endpoint support.
* Check API version.
* Do not repeatedly retry unsupported functionality.

---

## 502 Bad Gateway

A gateway or proxy received an invalid response from an upstream service.

Possible causes:

* Upstream service failure
* Proxy failure
* Network failure
* Deployment issue

### Recovery

* Check service health.
* Retry carefully.
* Check upstream dependencies.
* Report persistent errors.

---

## 503 Service Unavailable

The service is temporarily unable to process requests.

Possible causes:

* Maintenance
* Overload
* Deployment
* Dependency outage

### Recovery

* Wait.
* Respect `Retry-After`.
* Retry with backoff.
* Avoid sending large request bursts.

---

## 504 Gateway Timeout

A gateway did not receive a response from an upstream service in time.

### Recovery

* Check service availability.
* Check network conditions.
* Retry cautiously.
* Report persistent failures.

---

# 8. Common API Failures

## Network Failure

A network failure occurs when the browser cannot successfully communicate with the server.

Possible causes:

* No internet connection
* DNS failure
* Firewall
* Proxy failure
* Server outage
* TLS issue

### Troubleshooting

* Open developer tools.
* Check the Network tab.
* Check browser console.
* Verify the API URL.
* Verify connectivity.
* Check service availability.

---

## DNS Failure

DNS failures occur when a domain cannot be resolved.

Check:

* API hostname
* DNS configuration
* Environment configuration
* Network connection

---

## TLS Failure

TLS problems may prevent secure communication.

Possible causes:

* Invalid certificate
* Expired certificate
* Incorrect hostname
* Unsupported configuration

Do not bypass browser TLS security in production.

---

## CORS Failure

CORS problems prevent browsers from allowing certain cross-origin responses.

Common causes:

* Incorrect allowed origin
* Missing CORS headers
* Incorrect credentials configuration
* Failed preflight request

### Troubleshooting

1. Open browser developer tools.
2. Check the Console.
3. Check the Network tab.
4. Find the OPTIONS request.
5. Inspect response headers.
6. Verify allowed origin.
7. Verify allowed methods.
8. Verify allowed headers.

---

# 9. Authentication Errors

Authentication establishes the identity of a user.

## Missing Authentication

Symptoms:

* `401`
* Login redirect
* Protected request failure

Check:

* User login state
* Authentication cookie
* Authorization header
* Session state

---

## Expired Authentication

Symptoms:

* Previously working requests fail.
* API starts returning `401`.
* User appears logged in but protected operations fail.

### Recovery

* Refresh authentication if supported.
* Otherwise require login.
* Clear invalid state.
* Retry only after authentication succeeds.

---

## Invalid Token

Possible causes:

* Expired token
* Corrupted token
* Wrong environment
* Revoked token

### Recovery

* Remove invalid token state.
* Re-authenticate.
* Verify environment.
* Avoid infinite refresh loops.

---

# 10. Authorization Errors

Authentication and authorization are different concepts.

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to do?

A user can be authenticated but still receive `403`.

## Role-Based Authorization

Possible roles include:

* Attendee
* Organizer
* Moderator
* Administrator

Check:

* [ ] Role information is correct.
* [ ] Server-side authorization exists.
* [ ] Resource ownership is validated.
* [ ] Restricted actions are protected.

---

## Resource Ownership

For example:

```text
Organizer A
  |
  +-- Event 100
```

Organizer B should not be able to modify Event 100 unless explicitly authorized.

The frontend should never be considered the final authorization boundary.

---

# 11. Validation Errors

Validation errors indicate that supplied data does not meet API requirements.

## Required Field

```json
{
  "error": {
    "code": "REQUIRED_FIELD",
    "field": "title",
    "message": "Title is required."
  }
}
```

### Recovery

* Highlight the field.
* Display the error.
* Preserve valid form values.
* Ask the user to provide the missing value.

---

## Invalid Format

Example:

```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "field": "email",
    "message": "Enter a valid email address."
  }
}
```

### Recovery

* Identify the invalid field.
* Display an actionable message.
* Allow correction.
* Preserve other values.

---

## Invalid Date

Event APIs may validate:

* Start date
* Start time
* End date
* End time
* Time zone

Check:

* Start exists.
* End exists.
* End occurs after start.
* Time zone is valid.
* Date is supported.

---

## Invalid Capacity

An event capacity may require:

* Positive value
* Integer value
* Maximum allowed value

Example:

```json
{
  "error": {
    "field": "capacity",
    "message": "Capacity must be greater than zero."
  }
}
```

---

# 12. Request Errors

## Missing Parameters

Check:

* Required query parameters
* Required body properties
* Required headers
* Required path parameters

---

## Incorrect Parameter Types

Example:

```json
{
  "capacity": "large"
}
```

when the API expects:

```json
{
  "capacity": 500
}
```

### Recovery

Correct the type before submitting again.

---

## Invalid IDs

Common causes:

* Empty ID
* Wrong ID type
* Deleted resource
* ID from another environment

Check the source of IDs before making requests.

---

# 13. Network Errors

Network failures differ from HTTP errors.

For example:

```javascript
try {
  const response = await fetch("/api/events");
} catch (error) {
  // Network-level failure.
}
```

An HTTP `500` normally still produces a response object.

Therefore:

* Network failure means communication failed.
* HTTP failure means communication succeeded but the server returned an error status.

---

# 14. CORS Errors

CORS is enforced by browsers.

Common symptoms:

* Request appears blocked.
* Browser console reports CORS.
* Frontend cannot read response.
* OPTIONS request fails.

## CORS Checklist

* [ ] Frontend origin is known.
* [ ] API origin is known.
* [ ] Allowed origins are configured.
* [ ] Allowed methods are configured.
* [ ] Allowed headers are configured.
* [ ] Credentials configuration is correct.
* [ ] Preflight requests succeed.

Do not disable browser security as a production workaround.

---

# 15. Timeout Errors

Timeouts can occur at multiple layers:

* Browser
* Proxy
* API gateway
* Application server
* Database
* External service

## Troubleshooting

1. Measure request duration.
2. Inspect Network timing.
3. Check server health.
4. Check upstream dependencies.
5. Check payload size.
6. Check database performance if available.
7. Retry only when appropriate.

---

# 16. Rate Limiting

Rate limiting protects APIs from excessive traffic.

## Causes

* Rapid repeated clicks
* Polling too frequently
* Automatic retries
* Large batch operations
* Multiple browser tabs
* Automated scripts

## Prevention

* Debounce user actions.
* Avoid unnecessary polling.
* Cache safe responses.
* Use controlled retries.
* Respect API limits.

## 429 Handling

```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get("Retry-After");

  // Wait according to the API's instructions.
}
```

Do not continuously retry a rate-limited endpoint.

---

# 17. Error Response Structure

A consistent response structure simplifies frontend handling.

Recommended example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "title",
        "message": "Title is required."
      }
    ]
  }
}
```

## Error Code

Error codes should be stable identifiers.

Examples:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
ACCESS_DENIED
RESOURCE_NOT_FOUND
RATE_LIMITED
INTERNAL_ERROR
```

## Message

Messages should be useful but should not expose:

* Stack traces
* Database details
* Secrets
* Internal infrastructure
* Private configuration

## Details

Details can provide field-specific information.

---

# 18. Error Handling Examples

## Basic Fetch

```javascript
const response = await fetch("/api/events");

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

const data = await response.json();
```

---

## Status Handling

```javascript
async function getEvents() {
  const response = await fetch("/api/events");

  if (response.ok) {
    return response.json();
  }

  if (response.status === 401) {
    throw new Error("Authentication required");
  }

  if (response.status === 403) {
    throw new Error("Access denied");
  }

  if (response.status === 404) {
    throw new Error("Events not found");
  }

  if (response.status === 429) {
    throw new Error("Too many requests");
  }

  if (response.status >= 500) {
    throw new Error("Server unavailable");
  }

  throw new Error("Unexpected API error");
}
```

---

## Safe JSON Parsing

```javascript
async function parseError(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
```

---

# 19. Fetch Error Handling

A robust request helper should distinguish:

* Network errors
* HTTP errors
* Parsing errors
* Application errors

Example:

```javascript
async function request(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Unable to reach the API.");
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return response;
}
```

---

# 20. API Client Error Handling

Centralized handling can prevent duplicated logic.

Example:

```javascript
async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Network request failed.");
  }

  switch (response.status) {
    case 401:
      throw new Error("Authentication required.");

    case 403:
      throw new Error("Access denied.");

    case 404:
      throw new Error("Resource not found.");

    case 429:
      throw new Error("Too many requests.");

    default:
      if (response.status >= 500) {
        throw new Error("Server error.");
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
  }

  return response;
}
```

---

# 21. Troubleshooting Procedures

## Step 1: Identify the Request

Record:

* URL
* Method
* Status
* Time
* Environment
* User state

---

## Step 2: Inspect Network Tab

Review:

* Request URL
* Method
* Status
* Request headers
* Response headers
* Request body
* Response body
* Timing

---

## Step 3: Inspect Console

Look for:

* JavaScript exceptions
* CORS errors
* Network errors
* Parsing errors
* Authentication failures

---

## Step 4: Check Authentication

Verify:

* User is logged in.
* Session is valid.
* Required credentials are present.
* Correct environment is selected.

---

## Step 5: Check Authorization

Verify:

* User role.
* Resource ownership.
* Operation permissions.
* API authorization rules.

---

## Step 6: Check Request

Inspect:

* JSON
* IDs
* Dates
* Required fields
* Query parameters
* Headers

---

## Step 7: Check API Availability

For 5xx errors:

* Check service status.
* Check deployments.
* Check dependencies.
* Check server logs if available.

---

# 22. Recovery Recommendations

## 400

Correct the request.

Do not retry unchanged data.

## 401

Restore authentication.

Do not retry indefinitely.

## 403

Check authorization.

Do not attempt to bypass permissions.

## 404

Verify the resource and endpoint.

## 409

Refresh resource state and resolve the conflict.

## 422

Correct validation errors.

## 429

Wait and retry according to rate-limit guidance.

## 500

Retry cautiously and report persistent failures.

## 502

Check upstream services and retry carefully.

## 503

Wait for service recovery.

## 504

Check upstream availability and retry carefully.

---

# 23. Retry Strategies

Retries should be intentional.

## Do Not Automatically Retry

Generally avoid automatic retries for:

* 400
* 401
* 403
* 404
* 405
* 415
* 422

These usually require a change.

## Potentially Retry

Potential temporary failures include:

* 408
* 429
* 502
* 503
* 504

---

# Exponential Backoff

Example:

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryRequest(request, attempts = 3) {
  let delayMs = 500;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (attempt === attempts - 1) {
        throw error;
      }

      await delay(delayMs);
      delayMs *= 2;
    }
  }
}
```

Retry logic should have a maximum number of attempts.

---

# Idempotency

Be careful retrying operations that create or modify resources.

For example:

```text
POST /api/events
```

could create duplicate events if the original request succeeded but the response was lost.

For potentially non-idempotent operations:

* Check API documentation.
* Use idempotency keys when supported.
* Confirm resource state before retrying.
* Avoid duplicate submissions.

---

# 24. Logging Guidelines

Logs should provide useful diagnostics without exposing sensitive information.

## Safe Information

Potentially useful information:

* Status code
* Error code
* Endpoint category
* HTTP method
* Timestamp
* Correlation ID
* Non-sensitive context

## Do Not Log

Never log:

* Passwords
* Access tokens
* Refresh tokens
* Session cookies
* Private keys
* API secrets
* Sensitive personal information

---

# 25. Testing API Errors

Error paths should be tested just like successful paths.

## Authentication Tests

* [ ] Missing authentication.
* [ ] Invalid authentication.
* [ ] Expired authentication.
* [ ] Revoked authentication.
* [ ] Successful authentication.

## Authorization Tests

* [ ] Authorized user.
* [ ] Unauthorized user.
* [ ] Incorrect role.
* [ ] Incorrect resource owner.
* [ ] Administrator access.

## Validation Tests

* [ ] Missing field.
* [ ] Invalid type.
* [ ] Invalid format.
* [ ] Invalid date.
* [ ] Invalid ID.
* [ ] Duplicate data.
* [ ] Oversized input.

## Network Tests

* [ ] Offline mode.
* [ ] Timeout.
* [ ] Connection failure.
* [ ] Server unavailable.
* [ ] Slow response.

## HTTP Error Tests

* [ ] 400
* [ ] 401
* [ ] 403
* [ ] 404
* [ ] 409
* [ ] 422
* [ ] 429
* [ ] 500
* [ ] 502
* [ ] 503
* [ ] 504

---

# 26. Developer Checklist

Before submitting API-related changes:

* [ ] Success responses are handled.
* [ ] 400 errors are handled.
* [ ] 401 errors are handled.
* [ ] 403 errors are handled.
* [ ] 404 errors are handled.
* [ ] 409 errors are handled.
* [ ] 422 errors are handled.
* [ ] 429 errors are handled.
* [ ] 500 errors are handled.
* [ ] Network failures are handled.
* [ ] Timeout failures are handled.
* [ ] Invalid response data is handled.
* [ ] Authentication recovery is handled.
* [ ] Validation errors are displayed.
* [ ] Sensitive information is not logged.
* [ ] Retry behavior is controlled.
* [ ] User-facing messages are useful.

---

# 27. Troubleshooting Checklist

When an API request fails:

* [ ] Record the status.
* [ ] Inspect the response.
* [ ] Inspect the request.
* [ ] Check the URL.
* [ ] Check the HTTP method.
* [ ] Check request headers.
* [ ] Check request body.
* [ ] Check authentication.
* [ ] Check authorization.
* [ ] Check validation.
* [ ] Check network.
* [ ] Check CORS.
* [ ] Check API availability.
* [ ] Check environment configuration.
* [ ] Check API version.
* [ ] Determine whether retrying is safe.
* [ ] Document the resolution.

---

# 28. API Error Reporting Template

## Summary

**Title:** {{title}}

**Environment:** {{environment}}

**Endpoint:** {{endpoint}}

**Method:** {{method}}

**Status:** {{status}}

**Date:** {{date}}

## Description

{{description}}

## Steps to Reproduce

1. {{step_one}}
2. {{step_two}}
3. {{step_three}}

## Expected Result

{{expected_result}}

## Actual Result

{{actual_result}}

## Request

```text
Method: {{method}}
Endpoint: {{endpoint}}
```

## Response

```json
{
  "error": {
    "code": "{{error_code}}",
    "message": "{{error_message}}"
  }
}
```

## Environment

* Browser: {{browser}}
* Operating System: {{operating_system}}
* Application version: {{version}}
* API version: {{api_version}}

## Troubleshooting

* [ ] Network checked.
* [ ] Authentication checked.
* [ ] Authorization checked.
* [ ] Request checked.
* [ ] Response checked.
* [ ] API availability checked.
* [ ] Environment checked.

## Recovery

{{recovery}}

---

# 29. Common Event API Errors

## Event Creation

Potential failures:

* Missing title
* Invalid date
* Invalid capacity
* Unauthorized organizer
* Duplicate event
* Invalid venue

Check:

* [ ] Authentication.
* [ ] Organizer permissions.
* [ ] Required fields.
* [ ] Date validation.
* [ ] Capacity validation.

---

## Event Update

Potential failures:

* Event not found
* Event cancelled
* User not owner
* Invalid update
* Concurrent modification

Recovery:

* Fetch latest event.
* Verify permissions.
* Check current state.
* Apply valid changes.

---

## Event Deletion

Potential failures:

* Event not found
* User lacks permission
* Event cannot be deleted
* Related resources prevent deletion

Do not assume that a delete button being visible means deletion is authorized.

---

# Registration API Errors

## Duplicate Registration

A user may already be registered.

Possible response:

```json
{
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "You are already registered for this event."
  }
}
```

Recovery:

* Inform the user.
* Display existing registration where appropriate.
* Avoid submitting another registration.

---

## Event Full

The event may have reached capacity.

Recovery:

* Display the event capacity message.
* Offer a waitlist if supported.
* Do not repeatedly submit registration requests.

---

## Registration Closed

Registration may have ended.

Recovery:

* Display registration closed information.
* Check whether another registration period exists.

---

# Authentication API Errors

## Login Failure

Possible causes:

* Invalid credentials
* Account disabled
* Network failure
* Authentication service unavailable

Frontend behavior:

* Show a useful message.
* Avoid revealing unnecessary account information.
* Allow retry after correction.

---

## Session Expiration

When a session expires:

* Stop protected requests.
* Refresh authentication if supported.
* Otherwise redirect to login.
* Preserve intended navigation when appropriate.

---

# Feedback API Errors

Potential failures:

* Feedback already submitted
* Event not completed
* Registration not found
* Invalid rating
* Empty feedback

Recovery:

* Explain the issue.
* Preserve entered information where possible.
* Correct invalid fields.
* Avoid duplicate submissions.

---

# Sponsorship API Errors

Potential failures:

* Unauthorized organizer
* Invalid sponsorship amount
* Sponsor not found
* Duplicate sponsor
* Event not found

Recovery:

* Verify event ownership.
* Verify sponsor information.
* Validate the request.
* Refresh resource state.

---

# Speaker API Errors

Potential failures:

* Speaker invitation already exists
* Speaker unavailable
* Invalid email
* Event not found
* Insufficient organizer permissions

Recovery:

* Check speaker state.
* Check event state.
* Correct invalid information.
* Avoid duplicate invitations.

---

# Volunteer API Errors

Potential failures:

* Volunteer already registered
* Position unavailable
* Event registration closed
* Invalid volunteer information

Recovery:

* Check volunteer state.
* Check available positions.
* Refresh event information.
* Submit corrected data.

---

# 30. Error Message Guidelines

Error messages should be:

* Clear
* Concise
* Actionable
* Accurate
* Non-sensitive

## Poor

```text
Error 422.
```

## Better

```text
Please enter a valid event date.
```

## Poor

```text
Internal server exception at DatabaseService.
```

## Better

```text
We couldn't complete your request. Please try again later.
```

---

# 31. UI Error States

A frontend should account for multiple states.

Recommended states include:

* Loading
* Success
* Empty
* Validation error
* Authentication error
* Authorization error
* Network error
* Server error
* Retry state

## Loading

Display appropriate loading feedback.

## Empty

Explain when no resources are available.

## Error

Provide useful recovery instructions.

## Retry

Only show retry actions when retrying makes sense.

---

# 32. Error Recovery UX

Recovery should match the failure.

For validation:

```text
Correct the highlighted fields.
```

For authentication:

```text
Sign in again to continue.
```

For permissions:

```text
You do not have permission to perform this action.
```

For temporary server failure:

```text
The service is temporarily unavailable. Try again shortly.
```

For network failure:

```text
Check your connection and try again.
```

---

# 33. API Error Monitoring

For production applications, recurring API failures should be monitored.

Track where appropriate:

* Error rate
* Status distribution
* Endpoint failures
* Response latency
* Retry volume
* Rate-limit responses
* Authentication failures

Do not collect sensitive information unnecessarily.

---

# 34. Error Trends

Repeated errors can indicate larger problems.

Examples:

High `401` rate:

* Authentication issue
* Expired sessions
* Token configuration

High `403` rate:

* Permission configuration
* Role handling
* Authorization mismatch

High `404` rate:

* Broken routes
* Stale IDs
* Frontend/backend mismatch

High `429` rate:

* Excessive requests
* Polling problem
* Retry loop

High `5xx` rate:

* Backend issue
* Dependency failure
* Deployment problem

---

# 35. API Compatibility

When API contracts change:

* Update request formats.
* Update response parsing.
* Update error handling.
* Update documentation.
* Test old and new behavior when required.

Watch for:

* Removed fields
* Renamed fields
* Changed status codes
* Changed validation rules
* Changed authentication requirements

---

# 36. Error Handling During Deployments

Deployments can temporarily produce errors.

Check:

* API version compatibility.
* Frontend/backend deployment order.
* Database migration state.
* Environment variables.
* Feature flags.
* Dependency availability.

Avoid assuming every temporary error is a frontend bug.

---

# 37. Offline Handling

When the browser is offline:

* Detect network state where appropriate.
* Avoid unnecessary API calls.
* Inform the user.
* Preserve unsaved information when possible.
* Retry only after connectivity returns.

Do not discard user-entered data simply because a request failed.

---

# 38. Unsaved Form Data

When an API request fails:

* Preserve valid fields.
* Preserve user-entered information.
* Highlight invalid fields.
* Avoid resetting the entire form unnecessarily.

This improves recovery from validation and network failures.

---

# 39. Duplicate Submission Prevention

Users may click a submit button multiple times.

Consider:

* Disabling the button during submission.
* Tracking request state.
* Using idempotency support where available.
* Handling duplicate responses gracefully.

Example:

```javascript
if (isSubmitting) {
  return;
}

setIsSubmitting(true);
```

Always reset the state after completion.

---

# 40. Final API Error Reference

## Status Summary

| Status | Category       | Recommended Action   |
| ------ | -------------- | -------------------- |
| 200    | Success        | Process response     |
| 201    | Created        | Process new resource |
| 202    | Accepted       | Monitor operation    |
| 204    | Success        | Do not parse body    |
| 301    | Redirect       | Update endpoint      |
| 304    | Cache          | Reuse or refresh     |
| 400    | Client         | Correct request      |
| 401    | Authentication | Re-authenticate      |
| 403    | Authorization  | Check permissions    |
| 404    | Resource       | Verify resource      |
| 405    | Method         | Correct method       |
| 408    | Timeout        | Retry carefully      |
| 409    | Conflict       | Refresh state        |
| 410    | Gone           | Stop using resource  |
| 413    | Size           | Reduce payload       |
| 415    | Media type     | Correct content type |
| 422    | Validation     | Correct fields       |
| 429    | Rate limit     | Back off             |
| 500    | Server         | Retry/report         |
| 501    | Unsupported    | Check API            |
| 502    | Gateway        | Retry carefully      |
| 503    | Unavailable    | Wait/retry           |
| 504    | Timeout        | Retry carefully      |

---

# Final Checklist

Before merging API-related changes:

* [ ] HTTP status codes are handled.
* [ ] Authentication errors are handled.
* [ ] Authorization errors are handled.
* [ ] Validation errors are handled.
* [ ] Network errors are handled.
* [ ] CORS issues are considered.
* [ ] Timeout behavior is considered.
* [ ] Rate limiting is considered.
* [ ] Retry behavior is safe.
* [ ] Duplicate requests are considered.
* [ ] Error messages are actionable.
* [ ] Sensitive information is not logged.
* [ ] Error responses are parsed defensively.
* [ ] Tests cover important failure cases.
* [ ] Troubleshooting information is documented.
* [ ] Recovery behavior is documented.
* [ ] API documentation is up to date.

---

# Conclusion

API errors should be treated as expected application states rather than exceptional situations that can be ignored.

A reliable API integration should:

1. Detect the failure.
2. Identify the failure category.
3. Provide a safe and useful message.
4. Recover automatically when safe.
5. Ask the user for action when necessary.
6. Avoid unnecessary retries.
7. Protect sensitive information.
8. Provide useful diagnostic information.
9. Record recurring failures.
10. Test error paths before release.

This reference should be used when developing, reviewing, testing, and troubleshooting Eventra API integrations.
