import * as React from 'react';
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'avatar' | 'generic';
  name?: string; 
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackType = 'generic',
  name,
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const getInitials = (fullName?: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
if (error || !src) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold select-none ${className}`}
          title={alt || name}
        >
          {getInitials(name)}
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 border border-slate-200 text-slate-400 ${className}`}>
        <svg className="w-1/4 h-1/4 max-w-[48px] min-w-[24px] opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={`object-cover ${className}`} onError={() => setError(true)} {...props} />
  );
};
