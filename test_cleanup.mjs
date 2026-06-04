import React, { useEffect } from 'react';
import { renderHook } from '@testing-library/react';

function useTest() {
  let cleaned = false;
  useEffect(() => {
    return () => {
      cleaned = true;
    };
  }, []);
  return () => cleaned;
}

const { result, unmount } = renderHook(() => useTest());
console.log('Before unmount:', result.current());
unmount();
console.log('After unmount:', result.current());
