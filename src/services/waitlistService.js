const API_URL = process.env.REACT_APP_API_URL;

export const joinWaitlist = async (eventId, token) => {
  const response = await fetch(`${API_URL}/waitlist/join/${eventId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to join waitlist');
  return response.json();
};

export const leaveWaitlist = async (eventId, token) => {
  const response = await fetch(`${API_URL}/waitlist/leave/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to leave waitlist');
  return response.json();
};

export const getWaitlistStatus = async (eventId, token) => {
  const response = await fetch(`${API_URL}/waitlist/status/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return { onWaitlist: false, position: null };
  return response.json();
};

export const getWaitlistCount = async (eventId) => {
  const response = await fetch(`${API_URL}/waitlist/count/${eventId}`);
  if (!response.ok) return { count: 0 };
  return response.json();
};