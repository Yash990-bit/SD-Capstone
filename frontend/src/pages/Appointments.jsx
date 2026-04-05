import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Appointments() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // New Appointment Form State
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('medivault_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Profile
        const profileRes = await fetch('http://localhost:3001/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');
        const userData = profileData.user || profileData.data || profileData;
        setUser(userData);

        // Fetch Appointments based on role
        const endpoint = userData.role === 'doctor' 
          ? 'http://localhost:3001/api/appointments/doctor' 
          : 'http://localhost:3001/api/appointments/patient';
        
        const aptRes = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const aptData = await aptRes.json();
        if (aptRes.ok) {
          setAppointments(aptData.data || []);
        }

        // If patient, fetch doctors
        if (userData.role !== 'doctor') {
          const docRes = await fetch('http://localhost:3001/api/user/doctors', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const docData = await docRes.json();
          if (docRes.ok) {
            setDoctors(Array.isArray(docData) ? docData : (docData.data || []));
          }
        }
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Token') || err.message.includes('Not authorized')) {
          localStorage.removeItem('medivault_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const refreshAppointments = async () => {
    try {
      const endpoint = user.role === 'doctor' 
        ? 'http://localhost:3001/api/appointments/doctor' 
        : 'http://localhost:3001/api/appointments/patient';
      
      const aptRes = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const aptData = await aptRes.json();
      if (aptRes.ok) {
        setAppointments(aptData.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh appointments', err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!doctorId || !date || !time || !reason) {
      return alert('Please fill all fields');
    }

    setBooking(true);
    try {
      const res = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ doctorId, date, time, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to book appointment');

      alert('Appointment booked successfully!');
      // Reset form
      setDoctorId('');
      setDate('');
      setTime('');
      setReason('');
      
      // Refresh list
      refreshAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setBooking(false);
    }
  };

  const updateStatus = async (id, action) => {
    let notes = '';
    if (action === 'complete') {
      notes = prompt('Add any notes or prescription (optional):');
      if (notes === null) return; // User cancelled prompt
    }

    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}/${action}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ notes: notes || '' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} appointment`);
      
      refreshAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel appointment');
      
      refreshAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !user) return <div className="dashboard-loading">Loading Appointments...</div>;

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <h2>MediVault</h2>
        <div className="nav-right">
          <button onClick={() => navigate('/dashboard')} className="btn-outline">Dashboard</button>
          <button onClick={() => navigate('/documents')} className="btn-outline">Shared Docs</button>
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
          {user.role !== 'doctor' && (
            <div className="col">
              <div className="card">
                <h3>Book an Appointment</h3>
                <form onSubmit={handleBookAppointment} className="upload-form">
                  <div className="form-group">
                    <label>Select Doctor</label>
                    <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(doc => (
                        <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Routine Checkup" required />
                  </div>
                  <button type="submit" disabled={booking}>
                    {booking ? 'Booking...' : 'Book Appointment'}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className={`col ${user.role === 'doctor' ? 'full-width' : ''}`} style={user.role === 'doctor' ? { gridColumn: '1 / -1' } : {}}>
            <div className="card records-card">
              <h3>{user.role === 'doctor' ? 'Appointment Requests' : 'My Appointments'}</h3>
              {appointments.length === 0 ? (
                <p className="no-data">No appointments found.</p>
              ) : (
                <ul className="records-list">
                  {appointments.map(apt => (
                    <li key={apt._id} className="record-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                      <div className="record-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <strong>
                            {user.role === 'doctor' 
                              ? `Patient: ${apt.patientId?.name || 'Unknown'}` 
                              : `Doctor: Dr. ${apt.doctorId?.name || 'Unknown'}`}
                          </strong>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            backgroundColor: apt.status === 'Pending' ? '#b48600' : apt.status === 'Accepted' ? '#146c43' : apt.status === 'Rejected' || apt.status === 'Cancelled' ? '#9a1622' : '#0d6efd',
                            color: '#fff'
                          }}>
                            {apt.status}
                          </span>
                        </div>
                        <div style={{ marginTop: '5px' }}>
                          <span style={{ display: 'block', fontSize: '14px', color: '#e9ecf7' }}>Reason: {apt.reason}</span>
                          <span style={{ display: 'block', fontSize: '13px', marginTop: '4px'}}>
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </span>
                          {apt.notes && (
                            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#1a2235', borderRadius: '4px', fontSize: '13px' }}>
                              <strong>Notes/Prescription:</strong> {apt.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {user.role === 'doctor' && apt.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(apt._id, 'accept')} style={{ backgroundColor: '#198754' }}>Accept</button>
                            <button onClick={() => updateStatus(apt._id, 'reject')} style={{ backgroundColor: '#dc3545' }}>Reject</button>
                          </>
                        )}
                        {user.role === 'doctor' && apt.status === 'Accepted' && (
                          <button onClick={() => updateStatus(apt._id, 'complete')} style={{ backgroundColor: '#0d6efd' }}>Mark Completed</button>
                        )}
                        {user.role !== 'doctor' && (apt.status === 'Pending' || apt.status === 'Accepted') && (
                          <button onClick={() => cancelAppointment(apt._id)} style={{ backgroundColor: '#dc3545' }}>Cancel</button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
