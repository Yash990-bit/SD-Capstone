import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadDocument() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('Report');
  const [description, setDescription] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [permission, setPermission] = useState('VIEW');
  const [expiry, setExpiry] = useState('NEVER');
  const [uploading, setUploading] = useState(false);

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

      if (userData.role !== 'doctor') {
        const docRes = await fetch('http://localhost:3001/api/user/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const docData = await docRes.json();
        if (docRes.ok) {
          setDoctors(Array.isArray(docData) ? docData : (docData.data || []));
        }
      } else {
        // Only patients should upload here
        navigate('/documents');
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

  const handleDoctorSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedDoctors(selected);
  };

  const handleUploadAndShare = async (e) => {
    e.preventDefault();
    if (!file || !title || !documentType) return alert('Please provide the required fields.');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('documentType', documentType);
    formData.append('description', description);
    formData.append('permission', permission);
    formData.append('expiry', expiry);
    
    if (selectedDoctors.length > 0) {
      formData.append('doctorIds', JSON.stringify(selectedDoctors));
    }

    try {
      const res = await fetch('http://localhost:3001/api/documents/upload-and-share', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      alert('Document uploaded and shared successfully');
      navigate('/documents');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return <div className="dashboard-loading">Loading Upload...</div>;

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <h2>MediVault</h2>
        <div className="nav-right">
          <button onClick={() => navigate('/dashboard')} className="btn-outline">Dashboard</button>
          <span>{user.name} ({user.role})</span>
          <button onClick={() => {
            localStorage.removeItem('medivault_token');
            navigate('/login');
          }} className="btn-outline">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="upload-container" style={{ width: '100%', maxWidth: '600px' }}>
          {error && <div className="error-banner">{error}</div>}
          <div className="card">
            <h3>Upload & Securely Share Document</h3>
            <form onSubmit={handleUploadAndShare} className="upload-form">
              <div className="form-group">
                <label>Upload File</label>
                <input 
                  type="file" 
                  id="fileInputDocs"
                  onChange={(e) => setFile(e.target.files[0])} 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Document Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Blood Test Report" />
              </div>
              
              <div className="form-group">
                <label>Document Type</label>
                <select value={documentType} onChange={e => setDocumentType(e.target.value)} required>
                  <option value="Report">Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Scan">Scan</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short notes about the file" />
              </div>

              <div className="form-group">
                <label>Share With Doctor (Ctrl/Cmd+Click for multiple)</label>
                <select multiple value={selectedDoctors} onChange={handleDoctorSelect} style={{ height: '100px' }}>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                  ))}
                </select>
                <small>NOT all doctors get access. Only selected doctors will receive access.</small>
              </div>

              <div className="form-group">
                <label>Permission Level</label>
                <select value={permission} onChange={e => setPermission(e.target.value)}>
                  <option value="VIEW">View Only</option>
                  <option value="DOWNLOAD">View + Download</option>
                  <option value="FULL_ACCESS">Full Access</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expiry Time</label>
                <select value={expiry} onChange={e => setExpiry(e.target.value)}>
                  <option value="1H">1 Hour</option>
                  <option value="24H">24 Hours</option>
                  <option value="7D">7 Days</option>
                  <option value="NEVER">No Expiry</option>
                </select>
              </div>

              <button type="submit" disabled={uploading} style={{ padding: '12px', fontSize: '16px' }}>
                {uploading ? 'Processing...' : 'Upload & Share'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
