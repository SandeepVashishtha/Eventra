import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const AttendeeRosterTable = ({ attendees = [] }) => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: attendees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '600px',
        overflow: 'auto',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const attendee = attendees[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <div style={{ flex: 1 }}>{attendee.name}</div>
              <div style={{ flex: 1 }}>{attendee.email}</div>
              <div style={{ flex: 1 }}>{attendee.ticketType || 'Standard'}</div>
              <div style={{ flex: 1 }}>{attendee.status || 'Registered'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendeeRosterTable;
