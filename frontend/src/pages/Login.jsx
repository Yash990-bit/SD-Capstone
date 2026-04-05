import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('medivault_token', data.token || data.data?.token);
      alert('Login Successful!');
      navigate('/dashboard'); // or wherever you'd like to redirect after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2>MediVault Login</h2>
      {error && <p style={{color: '#ff6b6b'}}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{width: '100%'}}>Login</button>
      </form>
      <p style={{marginTop: 20, textAlign: 'center'}}>
        Don't have an account? <Link to="/signup" style={{color: '#5b8cff'}}>Sign up</Link>
      </p>
    </div>
  );
}
