export async function verifyCertificate(uid) {
  if (!uid) throw new Error('UID is required');
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/verify-certificate/${uid}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Verification failed');
  }
  const data = await response.json();
  // Expected shape: { name, skills: [], badges: [] }
  return data;
}
