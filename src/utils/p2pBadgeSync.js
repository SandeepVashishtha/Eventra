export const generateBadgeQR = (user) => {
  if (!user) return null;
  return JSON.stringify({ type: 'badge', userId: user.id, name: user.name, email: user.email });
};

export const syncBadgeViaWebRTC = async (badgeData) => {
  console.log('Syncing badge via local WebRTC data channel...', badgeData);
  return true;
};
