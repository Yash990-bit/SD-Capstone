import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('medivault_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Profile
        const profileRes = await fetch('http://localhost:3001/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');
        const userData = profileData.user || profileData.data || profileData;
        setUser(userData);

        // Fetch Records
        const recordsRes = await fetch('http://localhost:3001/api/records', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const recordsData = await recordsRes.json();
        if (recordsRes.ok) {
          setRecords(recordsData.data || recordsData);
        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Token') || err.message.includes('Not authorized')) {
          localStorage.removeItem('medivault_token');
          navigate('/login');
        }
      }
    };

    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchRecordsOnly = async () => {
    try {
      const recordsRes = await fetch('http://localhost:3001/api/records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();
      if (recordsRes.ok) {
        setRecords(recordsData.data || recordsData);
      }
    } catch {
      // Handle silently since it's just a refresh
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medivault_token');
    navigate('/login');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file first.');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3001/api/records/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      alert('Record uploaded successfully!');
      setFile(null);
      document.getElementById('fileInput').value = '';
      fetchRecordsOnly(); // Refresh records list
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="dashboard-loading">Loading MediVault...</div>;

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <h2>MediVault</h2>
        <div className="nav-right">
          <button onClick={() => navigate('/documents')} className="btn-outline">Shared Docs</button>
          <button onClick={() => navigate('/appointments')} className="btn-outline">Appointments</button>
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="btn-outline">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-banner">{error}</div>}

        {user.role === 'doctor' ? (
          <div className="grid-2">
            <div className="col">
              <div className="card">
                <h3>Doctor Profile</h3>
                <p><strong>Name:</strong> Dr. {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="col">
              <div className="card records-card">
                <h3>Patient Management</h3>
                {records.length === 0 ? (
                  <p className="no-data">No patient records found.</p>
                ) : (
                  <ul className="records-list">
                    {records.map(record => (
                      <li key={record._id} className="record-item">
                        <div className="record-info">
                          <strong>{record.originalName}</strong>
                          <div style={{fontSize: "0.85em", color: "#666", marginTop: "4px"}}>
                            Patient: <strong>{record.user?.name || 'Unknown Patient'}</strong>
                          </div>
                          <span>{(record.size / 1024 / 1024).toFixed(2)} MB • {new Date(record.createdAt).toLocaleString()}</span>
                        </div>
                        <a 
                          href={record.fileUrl || `http://localhost:3001/uploads/${record.fileName}`} 
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
            </div>
          </div>
        ) : (
          <div className="grid-2">
            {/* Profile & Upload Section */}
            <div className="col">
              <div className="card">
                <h3>Patient Profile</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="card">
                <h3>Upload Medical Document</h3>
                <p style={{ color: '#a8b2d1', marginBottom: '20px' }}>
                  Securely upload reports, prescriptions, and scans to share with your doctors.
                </p>
                <button 
                  onClick={() => navigate('/documents/upload')} 
                  style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                >
                  Upload & Share Document
                </button>
              </div>
            </div>

            {/* Records List Section */}
            <div className="col">
              <div className="card records-card">
                <h3>My Medical Records</h3>
                {records.length === 0 ? (
                  <p className="no-data">No medical records found. Upload one to get started.</p>
                ) : (
                  <ul className="records-list">
                    {records.map(record => (
                      <li key={record._id} className="record-item">
                        <div className="record-info">
                          <strong>{record.originalName}</strong>
                          <span>{(record.size / 1024 / 1024).toFixed(2)} MB • {new Date(record.createdAt).toLocaleString()}</span>
                        </div>
                        <a 
                          href={record.fileUrl || `http://localhost:3001/uploads/${record.fileName}`} 
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
