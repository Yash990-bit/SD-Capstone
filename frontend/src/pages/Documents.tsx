import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import type { User, MedicalDocument, ShareDocument } from '../types';

export default function Documents() {
  const [user, setUser] = useState<User | null>(null);
  const [myDocs, setMyDocs] = useState<MedicalDocument[]>([]);
  const [sharedDocs, setSharedDocs] = useState<ShareDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('medivault_token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await fetch('http://localhost:3001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');
      const userData: User = profileData.user || profileData.data || profileData;
      setUser(userData);

      if (userData.role === 'doctor') {
        const docsRes = await fetch('http://localhost:3001/api/documents/doctor/shared-documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const docsData = await docsRes.json();
        if (docsRes.ok) setSharedDocs(docsData.data || []);
      } else {
        const myRes = await fetch('http://localhost:3001/api/documents/patient/my-documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myData = await myRes.json();
        if (myRes.ok) setMyDocs(myData.data || []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
      if (msg.includes('Token')) {
        localStorage.removeItem('medivault_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate, fetchData]);

  const viewDoctorDoc = async (shareId: string, fileUrl: string) => {
    try {
      await fetch(`http://localhost:3001/api/documents/doctor/view/${shareId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('Failed to log access or open document.');
    }
  };

  const downloadDoc = async (shareId: string, fileUrl: string) => {
    await viewDoctorDoc(shareId, fileUrl);
  };

  const handleLogout = () => {
    localStorage.removeItem('medivault_token');
    navigate('/login');
  };

  if (loading || !user) return <div className="loading-screen">Loading Documents…</div>;

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      pageTitle="Documents"
      pageSubtitle={user.role === 'doctor' ? 'Documents shared with you by patients' : 'Your uploaded medical documents'}
    >
        {error && <div className="error-banner">{error}</div>}

        {user.role !== 'doctor' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                My Uploaded Documents
              </span>
              <button className="btn-outline" onClick={() => navigate('/documents/upload')}>
                + Upload New
              </button>
            </div>
            <div className="card">
              {myDocs.length === 0 ? (
                <p className="no-data">You haven't uploaded any documents yet.</p>
              ) : (
                <ul className="records-list">
                  {myDocs.map((doc) => (
                    <li key={doc._id} className="record-item" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div className="record-info" style={{ flex: 1 }}>
                        <strong>{doc.title}</strong>
                        <span style={{ color: '#a855f7', fontWeight: 500 }}>{doc.documentType}</span>
                        {doc.description && <span>{doc.description}</span>}
                        <span>Uploaded {new Date(doc.createdAt).toLocaleString()}</span>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-link"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="card">
            <p className="card-title">Shared Documents (Secure Inbox)</p>
            {sharedDocs.length === 0 ? (
              <p className="no-data">No documents have been shared with you.</p>
            ) : (
              <ul className="records-list">
                {sharedDocs.map((share) => (
                  <li
                    key={share.shareId}
                    className="record-item"
                    style={{ flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}
                  >
                    <div className="record-info" style={{ flex: 1 }}>
                      <strong>{share.document?.title || 'Untitled Document'}</strong>
                      <span style={{ color: '#a855f7', fontWeight: 500 }}>
                        {share.document?.documentType || 'Report'}
                      </span>
                      <span>
                        Patient: {share.patient?.name} ({share.patient?.email})
                      </span>
                      {share.document?.description && (
                        <span>Notes: {share.document.description}</span>
                      )}
                      <span>
                        Shared {new Date(share.sharedAt).toLocaleString()} &bull; Permission:{' '}
                        <strong>{share.permission}</strong>
                        {share.expiresAt &&
                          ` · Expires ${new Date(share.expiresAt).toLocaleString()}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'center' }}>
                      <button
                        className="btn-link"
                        onClick={() => viewDoctorDoc(share.shareId, share.document?.fileUrl)}
                      >
                        View
                      </button>
                      {(share.permission === 'DOWNLOAD' || share.permission === 'FULL_ACCESS') && (
                        <button
                          className="btn-sm btn-success"
                          onClick={() => downloadDoc(share.shareId, share.document?.fileUrl)}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
    </AppShell>
  );
}
