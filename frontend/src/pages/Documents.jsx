import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const [user, setUser] = useState(null);
  const [myDocs, setMyDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('medivault_token');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await fetch('http://localhost:3001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');
      const userData = profileData.user || profileData.data || profileData;
      setUser(userData);

      if (userData.role === 'doctor') {
        const docsRes = await fetch('http://localhost:3001/api/documents/doctor/shared-documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const docsData = await docsRes.json();
        if (docsRes.ok) setSharedDocs(docsData.data || []);
      } else {
        // Patient getting their own documents
        const myRes = await fetch('http://localhost:3001/api/documents/patient/my-documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myData = await myRes.json();
        if (myRes.ok) setMyDocs(myData.data || []);
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Token')) {
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

  const viewDoctorDoc = async (shareId, fileUrl) => {
    try {
      await fetch(`http://localhost:3001/api/documents/doctor/view/${shareId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('Failed to log access or open document.');
    }
  };

  const downloadDoc = async (shareId, fileUrl) => {
    // Basic download trigger handling: log first
    await viewDoctorDoc(shareId, fileUrl);
    // Ideally use backend proxy to force download headers. 
  };

  if (loading || !user) return <div className="dashboard-loading">Loading Documents...</div>;

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <h2>MediVault</h2>
        <div className="nav-right">
          <button onClick={() => navigate('/dashboard')} className="btn-outline">Dashboard</button>
          <button onClick={() => navigate('/appointments')} className="btn-outline">Appointments</button>
          <span>{user.name} ({user.role})</span>
          <button onClick={() => {
            localStorage.removeItem('medivault_token');
            navigate('/login');
          }} className="btn-outline">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}

        <div className="grid-2">
          {user.role !== 'doctor' ? (
            <div className="col" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--brand)' }}>My Uploaded Documents</h3>
                <button onClick={() => navigate('/documents/upload')} style={{ margin: 0 }}>
                  + Upload New Document
                </button>
              </div>

              <div className="card records-card">
                {myDocs.length === 0 ? (
                  <p className="no-data">You haven't uploaded any documents yet.</p>
                ) : (
                  <ul className="records-list">
                    {myDocs.map(doc => (
                      <li key={doc._id} className="record-item" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div className="record-info">
                          <strong>{doc.title}</strong>
                          <span style={{ display: 'block', color: 'var(--brand)', marginTop: '4px' }}>
                            {doc.documentType}
                          </span>
                          {doc.description && <span style={{ marginTop: '4px' }}>{doc.description}</span>}
                          <span style={{ display: 'block', marginTop: '8px' }}>
                            Uploaded on {new Date(doc.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-link"
                          style={{ margin: 0, padding: '8px 16px', background: '#333', color: '#fff' }}
                        >
                          View Original
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="col" style={{ gridColumn: '1 / -1' }}>
              <div className="card records-card">
                <h3>Shared Documents (Secure Inbox)</h3>
                {sharedDocs.length === 0 ? (
                  <p className="no-data">No documents have been shared with you.</p>
                ) : (
                  <ul className="records-list">
                    {sharedDocs.map(share => (
                      <li key={share.shareId} className="record-item" style={{ flexWrap: 'wrap' }}>
                        <div className="record-info">
                          <strong>{share.document?.title || 'Untitled Document'}</strong>
                          <div style={{fontSize: "0.85em", color: "var(--brand)", marginTop: "4px"}}>
                            Type: {share.document?.documentType || 'Report'}
                          </div>
                          <div style={{fontSize: "0.85em", color: "#e9ecf7", marginTop: "4px"}}>
                            Patient: {share.patient?.name} ({share.patient?.email})
                          </div>
                          {share.document?.description && (
                            <span style={{ display: 'block', marginTop: '4px' }}>Notes: {share.document.description}</span>
                          )}
                          <span style={{ display: 'block', marginTop: '8px' }}>
                            Shared: {new Date(share.sharedAt).toLocaleString()} • Perm: <strong>{share.permission}</strong>
                            {share.expiresAt && ` • Expires: ${new Date(share.expiresAt).toLocaleString()}`}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => viewDoctorDoc(share.shareId, share.document?.fileUrl)}
                              className="btn-outline"
                              style={{ margin: 0, padding: '8px 16px' }}
                            >
                              View Document
                            </button>
                            {(share.permission === 'DOWNLOAD' || share.permission === 'FULL_ACCESS') && (
                              <button 
                                onClick={() => downloadDoc(share.shareId, share.document?.fileUrl)}
                                style={{ margin: 0, padding: '8px 16px', background: '#198754' }}
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
