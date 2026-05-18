import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-3 font-semibold text-gray-700 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">No alerts found</div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  className={`p-3 border-b border-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <p className={`text-sm text-gray-800 ${!notif.isRead ? 'font-medium' : ''}`}>{notif.message}</p>
                  <span className="text-xs text-gray-400 block mt-1">
                    {new Date(notif.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}