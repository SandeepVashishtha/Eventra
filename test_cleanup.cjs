const React = require('react');
const { renderHook } = require('@testing-library/react');

function useTest() {
  let cleaned = false;
  React.useEffect(() => {
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
