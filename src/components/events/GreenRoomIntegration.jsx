/**
 * Green Room Integration Example
 * This file demonstrates how to integrate the Speaker Green Room with AIDirectorStream
 * and other parts of the Eventra application.
 * 
 * Usage Examples:
 * 
 * 1. Adding Green Room to your event page:
 *    import SpeakerGreenRoom from './SpeakerGreenRoom';
 *    <SpeakerGreenRoom eventId="your-event-id" roomId="your-event-green-room" />
 * 
 * 2. Adding Green Room navigation button:
 *    <button onClick={() => navigate(`/events/${eventId}/green-room`)}>
 *      Join Green Room
 *    </button>
 * 
 * 3. Listening for transition events from Green Room to live stage:
 *    const handleSpeakerTransition = (speaker) => {
 *      console.log(`${speaker.user.firstName} is ready to go live!`);
 *      // Connect to WebRTC and add speaker to your live stream
 *    };
 *    
 *    <SpeakerGreenRoom 
 *      eventId="your-event-id" 
 *      onTransitionToStage={handleSpeakerTransition} 
 *    />
 * 
 * 4. Protected route for Green Room (already configured in ProtectedRoutes.js):
 *    /events/:eventId/green-room
 *    
 *    This route is automatically protected to only allow:
 *    - SPEAKER
 *    - ADMIN  
 *    - ORGANIZER
 *    - OWNER
 *    - SUPER_ADMIN
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROLES, PERMISSIONS } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";

/**
 * GreenRoomAccessButton - A reusable button component for accessing Green Room
 */
export const GreenRoomAccessButton = ({ 
  eventId, 
  className = "",
  onClick: customOnClick 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  
  const finalEventId = eventId || paramEventId;
  
  // Check if user has access to Green Room
  const hasAccess = user && user.roles && (
    user.roles.includes(ROLES.SPEAKER) ||
    user.roles.includes(ROLES.ADMIN) ||
    user.roles.includes(ROLES.ORGANIZER) ||
    user.roles.includes(ROLES.OWNER) ||
    user.roles.includes(ROLES.SUPER_ADMIN)
  );

  // Check if user can manage transitions (organizer/admin)
  const canManage = user && user.roles && (
    user.roles.includes(ROLES.ADMIN) ||
    user.roles.includes(ROLES.ORGANIZER) ||
    user.roles.includes(ROLES.OWNER) ||
    user.roles.includes(ROLES.SUPER_ADMIN)
  );

  const handleClick = () => {
    if (customOnClick) {
      customOnClick();
    } else if (finalEventId) {
      navigate(`/events/${finalEventId}/green-room`);
    } else {
      navigate('/green-room');
    }
  };

  if (!hasAccess) {
    return null; // Don't show button if user doesn't have access
  }

  return (
    <button
      onClick={handleClick}
      className={`bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center space-x-2 ${className}`}
      title={canManage ? "View Green Room - Manage speaker transitions" : "Join Green Room - Prepare for your session"}
    >
      <span className="text-sm">🎤</span>
      <span className="text-sm">
        {canManage ? "Manage Green Room" : "Join Green Room"}
      </span>
    </button>
  );
};

/**
 * GreenRoomStatusIndicator - Shows current Green Room status
 */
export const GreenRoomStatusIndicator = ({ 
  eventId,
  roomId = "green-room"
}) => {
  const { user } = useAuth();
  const [speakersOnline, setSpeakersOnline] = React.useState(0);
  
  // In a real implementation, this would connect to WebSocket or use a hook
  // to get real-time data about speakers in the Green Room
  React.useEffect(() => {
    // Simulate checking Green Room status
    const interval = setInterval(() => {
      // This would be replaced with actual WebSocket or API call
      // For now, we'll simulate some activity
      setSpeakersOnline(Math.floor(Math.random() * 5));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [eventId, roomId]);

  if (!user || !(
    user.roles.includes(ROLES.SPEAKER) ||
    user.roles.includes(ROLES.ADMIN) ||
    user.roles.includes(ROLES.ORGANIZER)
  )) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-neutral-900/80 border border-neutral-700 rounded-lg px-3 py-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
      <div className="text-xs text-neutral-400">
        Green Room: {speakersOnline} speakers ready
      </div>
    </div>
  );
};

/**
 * GreenRoomTransitionHandler - Handles the transition logic between Green Room and live stream
 */
export const GreenRoomTransitionHandler = ({ 
  children,
  onSpeakerReady,
  onTransitionComplete
}) => {
  const { user } = useAuth();
  const [transitioningSpeaker, setTransitioningSpeaker] = React.useState(null);
  const [transitionStatus, setTransitionStatus] = React.useState('idle');

  const handleSpeakerTransition = React.useCallback((speaker) => {
    setTransitioningSpeaker(speaker);
    setTransitionStatus('connecting');
    
    if (onSpeakerReady) {
      onSpeakerReady(speaker);
    }
    
    // Simulate transition process
    setTimeout(() => {
      setTransitionStatus('complete');
      if (onTransitionComplete) {
        onTransitionComplete(speaker);
      }
      setTimeout(() => setTransitioningSpeaker(null), 3000);
    }, 2000);
  }, [onSpeakerReady, onTransitionComplete]);

  // Clone children with transition handler
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onTransitionToStage: handleSpeakerTransition
      });
    }
    return child;
  });

  return (
    <>
      {enhancedChildren}
      
      {/* Transition notification */}
      {transitioningSpeaker && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-neutral-900 border border-orange-500 rounded-lg px-6 py-3 z-50">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              transitionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`} />
            <div>
              {transitionStatus === 'connecting' ? (
                <span className="text-white text-sm">
                  Transitioning {transitioningSpeaker.user?.firstName || 'speaker'} to live stage...
                </span>
              ) : (
                <span className="text-emerald-400 text-sm">
                  {transitioningSpeaker.user?.firstName || 'Speaker'} is now LIVE! 🎤
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * useGreenRoomStatus - Hook for checking Green Room status
 */
export const useGreenRoomStatus = (eventId) => {
  const [status, setStatus] = React.useState({
    connected: false,
    speakerCount: 0,
    organizersOnline: 0
  });

  React.useEffect(() => {
    // This would typically connect to a WebSocket or use polling
    // For demonstration, we'll simulate status updates
    const interval = setInterval(() => {
      setStatus({
        connected: true,
        speakerCount: Math.floor(Math.random() * 8),
        organizersOnline: Math.floor(Math.random() * 3)
      });
    }, 15000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  return status;
};

/**
 * GreenRoomEventBanner - A banner to show Green Room availability
 */
export const GreenRoomEventBanner = ({ eventId, eventName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greenRoomStatus = useGreenRoomStatus(eventId);

  const hasAccess = user && user.roles && (
    user.roles.includes(ROLES.SPEAKER) ||
    user.roles.includes(ROLES.ADMIN) ||
    user.roles.includes(ROLES.ORGANIZER)
  );

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-900/50 to-neutral-900/80 border border-orange-700/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-orange-500">🎤</span>
          <div>
            <h3 className="text-white font-bold text-sm">Speaker Green Room Available</h3>
            <p className="text-neutral-400 text-xs">
              {eventName ? `Event: ${eventName}` : 'This event has a Green Room for speakers'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {greenRoomStatus.connected && (
            <div className="text-xs text-neutral-400">
              {greenRoomStatus.speakerCount} speakers, {greenRoomStatus.organizersOnline} organizers online
            </div>
          )}
          
          <GreenRoomAccessButton 
            eventId={eventId} 
            className="bg-orange-600 hover:bg-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

export default {
  GreenRoomAccessButton,
  GreenRoomStatusIndicator,
  GreenRoomTransitionHandler,
  useGreenRoomStatus,
  GreenRoomEventBanner
};