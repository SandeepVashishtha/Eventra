import React, { useState, useEffect } from 'react';
import { joinWaitlist, leaveWaitlist, getWaitlistStatus, getWaitlistCount } from '../../services/waitlistService';

const WaitlistButton = ({ eventId, isFullyBooked, waitlistEnabled, token, isAuthenticated }) => {
  const [onWaitlist, setOnWaitlist] = useState(false);
  const [position, setPosition] = useState(null);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFullyBooked || !waitlistEnabled) return;

    getWaitlistCount(eventId).then(data => setWaitlistCount(data.count));

    if (isAuthenticated && token) {
      getWaitlistStatus(eventId, token).then(data => {
        setOnWaitlist(data.onWaitlist);
        setPosition(data.position);
      });
    }
  }, [eventId, isFullyBooked, waitlistEnabled, isAuthenticated, token]);

  if (!isFullyBooked || !waitlistEnabled) return null;

  const handleClick = async () => {
    if (!isAuthenticated) {
      alert('Please log in to join the waitlist.');
      return;
    }
    setLoading(true);
    try {
      if (onWaitlist) {
        await leaveWaitlist(eventId, token);
        setOnWaitlist(false);
        setPosition(null);
        setWaitlistCount(prev => prev - 1);
      } else {
        const data = await joinWaitlist(eventId, token);
        setOnWaitlist(true);
        setPosition(data.position);
        setWaitlistCount(prev => prev + 1);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-gray-500">
        Event is full · {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} on waitlist
      </span>

      {onWaitlist && position && (
        <span className="text-sm font-medium text-blue-600">
          You are #{position} on the waitlist
        </span>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${
          onWaitlist
            ? 'bg-gray-500 hover:bg-gray-600'
            : 'bg-yellow-500 hover:bg-yellow-600'
        } disabled:opacity-50`}
      >
        {loading ? 'Please wait...' : onWaitlist ? 'Leave Waitlist' : 'Join Waitlist'}
      </button>
    </div>
  );
};

export default WaitlistButton;