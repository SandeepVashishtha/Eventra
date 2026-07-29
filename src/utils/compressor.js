export const simpleCompress = (str) => {
  try {
    return btoa(encodeURIComponent(str));
  } catch {
    return str;
  }
};

export const simpleDecompress = (compressed) => {
  try {
    return decodeURIComponent(atob(compressed));
  } catch {
    return compressed;
  }
};
