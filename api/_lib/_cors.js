export function buildCorsHeaders(req) {
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
    "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  };
}

export function corsResponse(req, res, statusCode, body) {
  const headers = buildCorsHeaders(req);
  if (res && typeof res.status === 'function') {
    res.status(statusCode);
    Object.entries(headers).forEach(([k, v]) => {
      if (typeof res.setHeader === 'function') res.setHeader(k, v);
    });
    return res.json(body);
  }
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    }
  });
}
