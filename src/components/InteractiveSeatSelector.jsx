import React, { useState } from 'react';

const SEAT_ROWS = ['A', 'B', 'C', 'D'];
const SEATS_PER_ROW = 8;
const TICKET_PRICES = { VIP: 150, Regular: 75 };

export const InteractiveSeatSelector = ({ reservedSeats = [], onSelectionChange }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatId, category) => {
    if (reservedSeats.includes(seatId)) return;

    let updated = [];
    if (selectedSeats.some((s) => s.id === seatId)) {
      updated = selectedSeats.filter((s) => s.id !== seatId);
    } else {
      updated = [...selectedSeats, { id: seatId, category, price: TICKET_PRICES[category] || 50 }];
    }

    setSelectedSeats(updated);
    if (onSelectionChange) {
      onSelectionChange(updated);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Select Your Seats</h3>
      <svg className="w-full max-w-lg h-64 mb-6 border rounded bg-white dark:bg-gray-800" viewBox="0 0 400 240">
        <rect x="50" y="10" width="300" height="20" rx="5" fill="#4A5568" />
        <text x="200" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">STAGE</text>

        {SEAT_ROWS.map((row, rowIndex) => {
          const category = rowIndex < 2 ? 'VIP' : 'Regular';
          return (
            <g key={row}>
              {Array.from({ length: SEATS_PER_ROW }).map((_, colIndex) => {
                const seatId = `${row}${colIndex + 1}`;
                const isReserved = reservedSeats.includes(seatId);
                const isSelected = selectedSeats.some((s) => s.id === seatId);

                let fill = category === 'VIP' ? '#8B5CF6' : '#3B82F6';
                if (isReserved) fill = '#9CA3AF';
                if (isSelected) fill = '#10B981';

                return (
                  <circle
                    key={seatId}
                    cx={60 + colIndex * 40}
                    cy={70 + rowIndex * 40}
                    r="12"
                    fill={fill}
                    className={isReserved ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
                    onClick={() => toggleSeat(seatId, category)}
                  >
                    <title>{`${seatId} (${category}) - ${isReserved ? 'Reserved' : isSelected ? 'Selected' : 'Available'}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="w-full max-w-lg flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded shadow">
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">Selected Seats: </span>
          <span className="text-indigo-600 font-bold">{selectedSeats.map((s) => s.id).join(', ') || 'None'}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">Total: </span>
          <span className="text-green-600 font-bold">${totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSeatSelector;
