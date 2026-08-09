# `api/` directory

This folder previously held Vercel Node serverless stubs. They are **not** the
canonical API.

Production traffic is rewritten by `vercel.json` to the Spring Boot backend:

`https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/api/*`

Implement new endpoints under `Backend/` (Spring). Do not add Node mock handlers
here unless they are explicitly gated behind a local demo flag and documented.
