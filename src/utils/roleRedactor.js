
export const redactSensitiveData = (data, userScopes) => {
  if (!data || typeof data !== 'object') return data;
  if (userScopes?.includes('admin:all') || userScopes?.includes('event:write')) return data;
  
  const redacted = Array.isArray(data) ? [...data] : { ...data };
  
  if (!Array.isArray(redacted)) {
    delete redacted.revenue;
    delete redacted.hostEmail;
    delete redacted.privateNotes;
    
    Object.keys(redacted).forEach(key => {
      if (typeof redacted[key] === 'object') {
        redacted[key] = redactSensitiveData(redacted[key], userScopes);
      }
    });
  } else {
    return redacted.map(item => redactSensitiveData(item, userScopes));
  }
  
  return redacted;
};
