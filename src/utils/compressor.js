export const simpleCompress = (str) => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (err) {
      console.warn("[compressor] Compression failed:", err);
    }
    return str;
  }
};

export const simpleDecompress = (compressed) => {
  try {
    return decodeURIComponent(atob(compressed));
  } catch (err) {
      console.warn("[compressor] Compression failed:", err);
    }
    return compressed;
  }
};
