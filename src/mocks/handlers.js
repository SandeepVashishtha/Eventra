import { http, HttpResponse } from "msw";

const API_URL = "https://eventra-api.sandeepvashishtha.tech";

export const handlers = [
  http.get(`${API_URL}/api/events`, () => {
    return HttpResponse.json([
      {
        id: "1",
        title: "Tech Conference 2026",
        date: "2026-07-15",
        category: "Conference",
        description: "A conference about technology.",
        location: "San Francisco, CA",
      },
      {
        id: "2",
        title: "Music Festival",
        date: "2026-08-20",
        category: "Festival",
        description: "Annual music festival.",
        location: "Austin, TX",
      },
    ]);
  }),

  http.get(`${API_URL}/api/events/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: "Tech Conference 2026",
      date: "2026-07-15",
      category: "Conference",
      description: "A conference about technology.",
      location: "San Francisco, CA",
    });
  }),

  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    if (process.env.NODE_ENV !== "production") {
      const body = await request.json();
      if (body.email === "test@eventra.com" && body.password === "password123") {
        return HttpResponse.json({
          token: "mock-jwt-token",
          user: { id: "1", name: "Test User", email: "test@eventra.com" },
        });
      }
      return new HttpResponse(null, { status: 401 });
    }
  }),

  http.post(`${API_URL}/api/auth/signup`, async ({ request }) => {
    const body = await request.json();
    if (body.email && body.password) {
      return HttpResponse.json({
        token: "mock-jwt-token",
        user: { id: "2", name: body.name || "New User", email: body.email },
      });
    }
    return new HttpResponse(null, { status: 400 });
  }),

  http.get(`${API_URL}/api/user/profile`, () => {
    return HttpResponse.json({
      id: "1",
      name: "Test User",
      email: "test@eventra.com",
    });
  }),

  http.post(`${API_URL}/api/events`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "3", ...body }, { status: 201 });
  }),

  http.get(`${API_URL}/api/github/contributors`, () => {
    return HttpResponse.json([
      { id: 1, login: "contributor1", contributions: 50 },
      { id: 2, login: "contributor2", contributions: 30 },
    ]);
  }),
];
