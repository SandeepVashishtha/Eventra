import React from 'react';
export default function CertificateGenerator({ userName, eventName }) {
  return (
    <div className="p-8 border-4 border-double border-yellow-500 text-center bg-white">
      <h1 className="text-3xl font-serif text-gray-800 mb-4">Certificate of Attendance</h1>
      <p className="text-lg">This is to certify that</p>
      <h2 className="text-2xl font-bold my-2">{userName || 'Attendee'}</h2>
      <p className="text-lg">has successfully participated in</p>
      <h3 className="text-xl font-semibold mt-2 text-indigo-600">{eventName || 'The Event'}</h3>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded shadow" onClick={() => window.print()}>
        Download Certificate
      </button>
    </div>
  );
}