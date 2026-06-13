# Authentication Rate Limiting

## Overview

Eventra implements client-side protections for authentication flows to reduce rapid repeated submissions and improve user experience.

## Features

- Request throttling for login attempts
- Temporary client-side lockouts
- Exponential backoff after repeated failures
- Retry countdown messages
- Automatic disabling of submit buttons during authentication requests
- Respect for server-provided Retry-After headers

## Security Benefits

- Reduces brute-force attempts
- Prevents accidental repeated submissions
- Decreases unnecessary backend load
- Improves authentication feedback

## Limitations

Client-side rate limiting is an additional usability and security layer and does not replace backend authentication protections.