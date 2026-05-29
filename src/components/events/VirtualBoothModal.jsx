import React from 'react';
import { X, Phone, Mail } from 'lucide-react';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';

/**
 * VirtualBoothModal renders details of a sponsor booth.
 * Props:
 *  - booth: object containing id, name, logo, media (array of URLs), jobs (array), contact (mailto link)
 *  - onClose: function to close the modal
 */
const VirtualBoothModal = ({ booth, onClose }) => {
  if (!booth) return null;

  return (
    <Dialog isOpen={true} onDismiss={onClose} aria-label="Sponsor Booth Details">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <div className="flex flex-col items-center space-y-4 p-4">
        <img src={booth.logo} alt={booth.name} className="w-24 h-24 rounded-lg shadow-md" />
        <h2 className="text-lg font-semibold text-gray-800">{booth.name}</h2>
        {/* Media carousel (simple) */}
        {booth.media && booth.media.length > 0 && (
          <div className="w-full flex overflow-x-auto space-x-2">
            {booth.media.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${booth.name} media ${idx + 1}`}
                className="flex-shrink-0 w-48 h-32 object-cover rounded-md shadow"
              />
            ))}
          </div>
        )}
        {/* Job openings */}
        {booth.jobs && booth.jobs.length > 0 && (
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Open Positions</h3>
            <ul className="list-disc list-inside text-gray-600">
              {booth.jobs.map((job, idx) => (
                <li key={idx}>{job}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Contact button */}
        {booth.contact && (
          <a
            href={booth.contact}
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
          >
            <Mail size={16} className="mr-1" />
            Talk to Representative
          </a>
        )}
      </div>
    </Dialog>
  );
};

export default VirtualBoothModal;
