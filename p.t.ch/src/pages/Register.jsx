import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css'; // CSS משותף להתחברות והרשמה

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password });
      setSuccessMsg('הרשמה הצליחה! אפשר להתחבר עכשיו.');
      setError('');
      setUsername('');
      setPassword('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה');
      setSuccessMsg('');
    }
  };

  return (
    <div className="auth-container">
      <div className="overlay" />
      <div className="auth-box">
        <h1 className="main-title">הבלוג הקהילתי של תהילה</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-username" className="visually-hidden">שם משתמש</label>
          <input
            id="register-username"
            name="username"
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="register-password" className="visually-hidden">סיסמה</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
          <button type="submit">הרשם</button>
        </form>
        <p style={{ marginTop: 10 }}>
          יש לך משתמש? <Link to="/login">התחבר כאן</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
