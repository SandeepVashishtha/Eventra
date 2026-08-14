/**
 * DynamicBarcodeCard.jsx
 * 
 * Anti-Screenshot Dynamic Barcode Overlay for Tickets
 * 
 * Generates dynamic ticket barcodes that rotate their underlying tokens every 15 seconds,
 * preventing unauthorized check-ins from static screenshots.
 * 
 * @component
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { ShieldCheck, Ticket, AlertCircle, Download, Copy, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import RotationProgressBar from './RotationProgressBar';
import {
  generateDynamicBarcodePayload,
  getSecondsUntilRotation,
  createQrValue,
  parseQrValue,
  DEFAULT_ROTATION_INTERVAL
} from '../../../../utils/security/barcode/dynamicTokenGenerator';

/**
 * Dynamic Barcode Card Component
 * 
 * Displays a QR code that automatically refreshes with new tokens every 15 seconds.
 * Includes anti-screenshot features like watermark overlays and rotation indicators.
 * 
 * @param {Object} props - Component props
 * @param {string} props.ticketId - Unique ticket identifier
 * @param {string} props.userId - User identifier (email, username, or ID)
 * @param {string} [props.eventId] - Optional event identifier
 * @param {string} [props.eventName] - Event name for display
 * @param {string} [props.userName] - User's full name for display
 * @param {string} [props.secret] - Optional secret key for enhanced security
 * @param {number} [props.interval=15] - Token rotation interval in seconds
 * @param {number} [props.size=200] - QR code size in pixels
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showDetails=true] - Whether to show ticket details
 * @param {boolean} [props.showProgress=true] - Whether to show rotation progress
 * @param {boolean} [props.offlineReady=false] - Whether to show offline-ready indicator
 * @returns {JSX.Element} - Dynamic barcode card component
 */
const DynamicBarcodeCard = ({
  ticketId,
  userId,
  eventId,
  eventName,
  userName,
  secret = '',
  interval = DEFAULT_ROTATION_INTERVAL,
  size = 200,
  className = '',
  showDetails = true,
  showProgress = true,
  offlineReady = false
}) => {
  // State for dynamic token and countdown
  const [payload, setPayload] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(interval);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate initial payload
  useEffect(() => {
    const generatePayload = async () => {
      setIsLoading(true);
      try {
        const initialPayload = await generateDynamicBarcodePayload({
          userId,
          ticketId,
          eventId,
          secret,
          interval
        });
        setPayload(initialPayload);
        setSecondsLeft(getSecondsUntilRotation(interval));
      } catch (error) {
        console.error('Failed to generate dynamic barcode payload:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generatePayload();
  }, [userId, ticketId, eventId, secret, interval]);
  
  // Token rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Regenerate payload asynchronously when countdown reaches 0
          generateDynamicBarcodePayload({
            userId,
            ticketId,
            eventId,
            secret,
            interval
          }).then(newPayload => {
            setPayload(newPayload);
          }).catch(error => {
            console.error('Failed to regenerate payload:', error);
          });
          return interval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [userId, ticketId, eventId, secret, interval]);
  
  // Sync seconds left with actual time
  useEffect(() => {
    const syncTimer = setInterval(() => {
      const remaining = getSecondsUntilRotation(interval);
      // Only update if we're significantly out of sync (more than 500ms difference)
      if (Math.abs(secondsLeft - remaining) > 0.5) {
        setSecondsLeft(remaining);
      }
    }, 500);
    
    return () => clearInterval(syncTimer);
  }, [secondsLeft, interval]);
  
  // Generate QR code value from payload
  const qrValue = useMemo(() => {
    if (!payload) return '';
    return createQrValue(payload);
  }, [payload]);
  
  // Handle copy to clipboard
  const handleCopyToken = useCallback(async () => {
    if (!qrValue) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
      console.warn('Clipboard API not available');
    }
  }, [qrValue]);
  
  // Handle QR code download
  const handleDownload = useCallback(() => {
    if (!payload) return;
    
    const qrString = createQrValue(payload);
    const blob = new Blob([qrString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventra-dynamic-token-${ticketId || 'ticket'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [payload, ticketId]);
  
  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);
  
  // Format ticket ID for display
  const displayTicketId = useMemo(() => {
    if (!ticketId) return 'N/A';
    if (ticketId.length > 16) {
      return `${ticketId.slice(0, 8)}...${ticketId.slice(-6)}`;
    }
    return ticketId;
  }, [ticketId]);
  
  // If no ticket data, show empty state
  if (!ticketId || !userId) {
    return (
      <div
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 text-sm ${className}`}
        role="status"
        aria-label="Dynamic barcode unavailable"
      >
        <div className={`w-[${size}px] h-[${size}px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center`}>
          <span className="text-xs text-center px-4">Dynamic barcode not available</span>
        </div>
        <p className="text-xs">No ticket or user data provided</p>
      </div>
    );
  }
  
  // Masked token display (show first and last 2 characters)
  const maskedToken = payload?.token ? `${payload.token.slice(0, 2)}...${payload.token.slice(-2)}` : '';
  
  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="region"
      aria-label={`Dynamic barcode for ${eventName || 'event'} - ${userName || 'user'}`}
    >
      {/* Anti-Screenshot Watermark Layer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* QR Code Frame */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 relative">
        {/* Security Shield Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold">
          <ShieldCheck className="w-3 h-3" />
          <span>SECURE</span>
        </div>
        
        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-xl shadow-inner border-4 border-indigo-500/30 relative">
          {isVisible ? (
            <>
              {isLoading ? (
                <div className={`w-[${size}px] h-[${size}px] flex items-center justify-center text-xs text-indigo-500`}>
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : qrValue ? (
                <QRCode
                  value={qrValue}
                  size={size}
                  bgColor="#FFFFFF"
                  fgColor="#0F172A"
                  aria-label={`Dynamic QR code for ticket ${ticketId}`}
                />
              ) : (
                <div className={`w-[${size}px] h-[${size}px] flex items-center justify-center text-xs text-gray-400`}>
                  Error generating code
                </div>
              )}
              
              {/* Anti-Screenshot Overlay Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(45deg,#6366f1_25%,transparent_25%),linear-gradient(-45deg,#6366f1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#6366f1_75%),linear-gradient(-45deg,transparent_75%,#6366f1_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0px]" />
            </>
          ) : (
            <div className={`w-[${size}px] h-[${size}px] bg-gray-100 rounded-lg flex items-center justify-center`}>
              <EyeOff className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Visibility Toggle */}
        <button
          type="button"
          onClick={toggleVisibility}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label={isVisible ? 'Hide QR code' : 'Show QR code'}
          title={isVisible ? 'Hide QR code' : 'Show QR code'}
        >
          {isVisible ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>{isVisible ? 'Hide' : 'Show'}</span>
        </button>
        
        {/* Progress Bar */}
        {showProgress && (
          <RotationProgressBar 
            secondsLeft={secondsLeft} 
            maxSeconds={interval}
          />
        )}
        
        {/* Token Info */}
        <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">
          <p>Token: <span className="font-mono font-semibold text-indigo-400">{maskedToken}</span></p>
          <p>Expires in: <span className="font-semibold">{secondsLeft}s</span></p>
        </div>
      </div>
      
      {/* Ticket Details Block */}
      {showDetails && (
        <div className="w-full max-w-xs space-y-2 text-sm">
          {eventName && (
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug">
              {eventName}
            </p>
          )}
          
          {userName && (
            <p className="text-xs text-center text-indigo-600 dark:text-indigo-400">
              {userName}
            </p>
          )}
          
          <p className="text-xs text-center font-mono text-gray-400 dark:text-gray-500 truncate" title={ticketId}>
            ID: {displayTicketId}
          </p>
          
          {/* Offline-Ready Badge */}
          {offlineReady && (
            <div className="flex justify-center pt-1">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400"
                role="status"
                aria-label="Offline-ready ticket"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Offline-Ready
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Download QR code token"
          title="Download token"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Download
        </button>
        
        <button
          type="button"
          onClick={handleCopyToken}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label={copied ? "Token copied" : "Copy ticket token to clipboard"}
          title="Copy token"
        >
          {copied ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      
      {/* Anti-Screenshot Warning */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Screenshots are disabled. QR code refreshes every {interval} seconds.</span>
      </div>
    </div>
  );
};

DynamicBarcodeCard.propTypes = {
  ticketId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  eventId: PropTypes.string,
  eventName: PropTypes.string,
  userName: PropTypes.string,
  secret: PropTypes.string,
  interval: PropTypes.number,
  size: PropTypes.number,
  className: PropTypes.string,
  showDetails: PropTypes.bool,
  showProgress: PropTypes.bool,
  offlineReady: PropTypes.bool
};

export default DynamicBarcodeCard;
