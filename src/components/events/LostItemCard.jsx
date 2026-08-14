import React from "react";
import { useNavigate } from "react-router-dom";
import { Image, Tag, Clock, MapPin, User, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

const LostItemCard = ({
  item,
  showContactInfo = true,
  showStatus = true,
  onClaim = null,
  onDelete = null,
  isCurrentUserOwner = false
}) => {
  const navigate = useNavigate();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        return "Just now";
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffHours < 48) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return "Unknown";
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (item.status) {
      case 'FOUND':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'CLAIMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'RETURNED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'FOUND':
        return 'Found';
      case 'CLAIMED':
        return 'Claimed';
      case 'RETURNED':
        return 'Returned';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return 'Found';
    }
  };

  const handleClaimClick = (e) => {
    e.stopPropagation();
    if (onClaim) {
      onClaim(item);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title || 'Lost item'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
              <Image className="h-16 w-16 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Status Badge */}
          {showStatus && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor()}`}>
                {item.isClaimed ? <CheckCircle size={12} /> : <Clock size={12} />}
                {item.isClaimed ? 'Claimed' : getStatusText()}
              </span>
            </div>
          )}
          
          {/* Claimed Overlay */}
          {item.isClaimed && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm">
                <CheckCircle className="text-green-600" size={16} />
                Claimed
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                  {item.title || 'Untitled Item'}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                  <Tag size={12} />
                  {item.category}
                </span>
              )}
              
              {item.locationFound && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                  <MapPin size={12} />
                  {item.locationFound}
                </span>
              )}
            </div>

            {/* AI Generated Tags */}
            {item.aiGeneratedTags && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.aiGeneratedTags.split(',').slice(0, 3).map((tag, index) => (
                  <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer with metadata and actions */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {item.foundByName && (
                <span className="inline-flex items-center gap-1">
                  <User size={12} />
                  {item.foundByName}
                </span>
              )}
              
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatDate(item.createdAt)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!item.isClaimed && onClaim && (
                <button
                  onClick={handleClaimClick}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <CheckCircle size={14} />
                  Claim
                </button>
              )}
              
              {isCurrentUserOwner && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <XCircle size={14} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information (Expandable) */}
        {showContactInfo && (item.contactEmail || item.contactPhone) && (
          <div className="border-t border-gray-200 px-4 pb-3 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact:</p>
            <div className="flex items-center gap-3">
              {item.contactEmail && (
                <a 
                  href={`mailto:${item.contactEmail}`} 
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Mail size={14} />
                  {item.contactEmail}
                </a>
              )}
              {item.contactPhone && (
                <a 
                  href={`tel:${item.contactPhone}`} 
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Phone size={14} />
                  {item.contactPhone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LostItemCard;