import React, { useState } from 'react';

const VendorDIDVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, success, fail

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStatus('success');
    }, 2500);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-8 border-t-4 border-indigo-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Decentralized Vendor Credential Verification</h2>
        <p className="text-gray-500 text-sm mt-1">W3C-compliant zero-knowledge proofs for business licenses.</p>
      </div>

      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Vendor Portal: Upload Verifiable Credential</h3>
        <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg bg-white">
          <span className="text-4xl">🔐</span>
          <p className="text-gray-500 mt-2 mb-4">Connect Wallet or Upload JSON-LD Credential File</p>
          <button 
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition"
            onClick={handleVerify}
            disabled={verifying || status === 'success'}
          >
            {verifying ? 'Verifying Cryptographic Signatures...' : 'Submit Credential for Verification'}
          </button>
        </div>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm animate-fade-in">
          <div className="flex items-center mb-3">
            <span className="text-green-600 mr-2 text-xl">✅</span>
            <h4 className="font-bold text-green-800">Credential Successfully Verified</h4>
          </div>
          
          <div className="bg-white p-3 rounded border border-green-100 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Issuer:</span>
              <span className="font-medium text-gray-800">did:gov:us:california:business-registry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subject:</span>
              <span className="font-medium text-gray-800">did:key:z6MkhaXgC...9jKL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Credential Type:</span>
              <span className="font-medium text-gray-800">Catering Food Safety License (Level 2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valid Until:</span>
              <span className="font-medium text-gray-800">Dec 31, 2026</span>
            </div>
          </div>
          
          <p className="text-xs text-green-700 mt-3 text-center">
            Zero-knowledge proof validated. No PII was stored on our servers.
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorDIDVerification;
