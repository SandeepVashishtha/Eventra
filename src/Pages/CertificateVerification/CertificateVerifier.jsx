import { useState } from 'react';
import { Input } from '../../components/common/Input';
import { exportToCSV } from '../../utils/exportUtils';
import { verifyCertificate } from '../../utils/certificateUtils';
import { toast } from 'react-toastify';
import { LinkedInShareButton } from '../../components/common/LinkedInShareButton';

// Glassmorphic container style
const containerStyle = {
  backdropFilter: 'blur(12px)',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '600px',
  margin: 'auto',
  color: '#fff',
};

export const CertificateVerifier = () => {
  const [uid, setUid] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    const { success, data, error } = await verifyCertificate(uid.trim());
    if (success) {
      setResult(data);
      toast.success('Certificate verified!');
    } else {
      toast.error(error || 'Verification failed');
      setResult(null);
    }
  };

  return (
    <section style={containerStyle} className="glassmorphic">
      <h2 className="text-2xl font-bold mb-4">Certificate Verification</h2>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter Certificate UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="flex-1 bg-white/20 text-white placeholder:text-white/70"
          label="Certificate UID"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition"
          aria-label="Verify certificate"
        >
          Verify
        </button>
      </div>
      {result && (
        <div className="mt-4 p-4 bg-white/10 rounded">
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Skills:</strong> {result.skills?.join(', ')}</p>
          <p><strong>Badges:</strong> {result.badges?.join(', ')}</p>
          <button
            onClick={() => exportToCSV([result], 'certificate')}
            className="mt-2 mr-2 px-3 py-1 bg-emerald-600 rounded hover:bg-emerald-700"
          >
            Export CSV
          </button>
          <LinkedInShareButton
            title="Verified Certificate"
            url={`https://eventra.com/verify-certificate/${uid}`}
            summary={
              `Verified certificate for ${result.name} with skills ${result.skills?.join(', ')}`
            }
          />
        </div>
      )}
    </section>
  );
};

export default CertificateVerifier;
