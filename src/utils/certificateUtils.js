export async function verifyCertificate(uid) {
  if (!uid) throw new Error('UID is required');
  const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${apiBaseUrl}/api/verify-certificate/${uid}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Verification failed');
  }
  const data = await response.json();
  // Expected shape: { name, skills: [], badges: [] }
  return data;
}
