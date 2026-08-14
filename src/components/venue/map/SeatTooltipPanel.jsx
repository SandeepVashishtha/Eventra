import { useState, useEffect, memo } from 'react';
import { Check, X, DollarSign, Ticket, User, Clock, MapPin } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SeatTooltipPanel - Displays detailed information about a seat on hover/click
 * 
 * Features:
 * - Shows seat ID, price, availability
 * - Displays seat coordinates in the venue
 * - Shows booking information if reserved
 * - Animates in/out smoothly
 * - Responsive design with Tailwind CSS
 * 
 * @param {Object} props - Component props
 * @param {Object} props.seat - Seat data object
 * @param {string} props.seat.id - Seat identifier (e.g., "A1", "B2")
 * @param {number} props.seat.price - Seat price in dollars
 * @param {number} props.seat.state - Seat state (0=available, 1=selected, 2=reserved, 3=hover)
 * @param {number} [props.seat.x] - X coordinate in venue space
 * @param {number} [props.seat.y] - Y coordinate in venue space
 * @param {string} [props.seat.category] - Seat category (e.g., "VIP", "Regular")
 * @param {Object} [props.seat.reservation] - Reservation info if reserved
 * @param {string} [props.seat.reservation.by] - Name of person who reserved
 * @param {string} [props.seat.reservation.time] - Reservation timestamp
 * @param {number} [props.seat.row] - Row identifier
 * @param {number} [props.seat.column] - Column identifier
 * @param {boolean} props.visible - Whether tooltip is visible
 * @param {Object} props.position - Position of tooltip
 * @param {number} props.position.x - X position for tooltip
 * @param {number} props.position.y - Y position for tooltip
 * @param {Function} props.onSelect - Callback when select button is clicked
 * @param {Function} props.onClose - Callback when tooltip should close
 */
const SeatTooltipPanel = ({
  seat,
  visible,
  position,
  onSelect,
  onClose,
}) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setIsAnimatingIn(true);
    } else {
      setIsAnimatingIn(false);
    }
  }, [visible]);

  if (!visible || !seat) {
    return null;
  }

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(seat.price || 0);

  // Determine seat status
  const getStatus = () => {
    if (seat.state === 2) return { label: 'Reserved', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: <User className="w-3 h-3" /> };
    if (seat.state === 1) return { label: 'Selected', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: <Check className="w-3 h-3" /> };
    if (seat.state === 3) return { label: 'Hovered', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: <MapPin className="w-3 h-3" /> };
    return { label: 'Available', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: <Ticket className="w-3 h-3" /> };
  };

  const status = getStatus();

  // Determine if seat can be selected
  const canSelect = seat.state !== 2; // Cannot select if reserved

  return (
    <div
      className={`fixed z-50 pointer-events-none`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className={`w-64 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ease-out ${
          isAnimatingIn 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        style={{ transitionProperty: 'opacity, transform' }}
        onTransitionEnd={() => {
          if (!visible) onClose?.();
        }}
      >
        {/* Tooltip content - pointer-events-auto to allow interaction */}
        <div className="pointer-events-auto bg-white dark:bg-gray-900">
          
          {/* Header */}
          <div className={`p-4 pb-3 border-b border-gray-100 dark:border-gray-800`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${status.bg}`}>
                  {status.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{seat.id}</h3>
                  <p className={`text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            
            {/* Price */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <DollarSign className="w-3 h-3" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Price</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{formattedPrice}</span>
            </div>

            {/* Category */}
            {seat.category && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <Ticket className="w-3 h-3" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Category</span>
                </div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{seat.category}</span>
              </div>
            )}

            {/* Row and Column */}
            {seat.row !== undefined && seat.column !== undefined && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Location</span>
                </div>
                <span className="font-mono text-gray-900 dark:text-white text-sm">Row {seat.row}, Col {seat.column}</span>
              </div>
            )}

            {/* Reservation info */}
            {seat.state === 2 && seat.reservation && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reserved By</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{seat.reservation.by}</p>
                {seat.reservation.time && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(seat.reservation.time).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer with action button */}
          <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                if (canSelect && onSelect) {
                  onSelect(seat);
                }
              }}
              disabled={!canSelect}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                canSelect
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {seat.state === 1 ? 'Deselect Seat' : seat.state === 2 ? 'Seat Reserved' : 'Select Seat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SeatTooltipPanel.propTypes = {
  seat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    state: PropTypes.number.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    category: PropTypes.string,
    row: PropTypes.number,
    column: PropTypes.number,
    reservation: PropTypes.shape({
      by: PropTypes.string,
      time: PropTypes.string,
    }),
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};

export default memo(SeatTooltipPanel);
