import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css'; // CSS משותף

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      login(res.data.user, res.data.token);
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהתחברות');
    }
  };

  return (
    <div className="auth-container">
      <div className="overlay" />
      <div className="auth-box">
        <h1 className="main-title">הבלוג הקהילתי של תהילה</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username" className="visually-hidden">שם משתמש</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="password" className="visually-hidden">סיסמה</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">התחבר</button>
        </form>
        <p style={{ marginTop: 10 }}>
          אין לך משתמש? <Link to="/register">להרשמה</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
