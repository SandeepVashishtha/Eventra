import React, { useState, useEffect } from 'react';

const OnlineBanner = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 
                    bg-green-500 text-white text-center 
                    py-2 text-sm font-medium">
      ✅ You're back online!
    </div>
  );
};

export default OnlineBanner;