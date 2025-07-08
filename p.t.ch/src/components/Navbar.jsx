import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './Navbar.css';  // ייבוא ה-CSS

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/posts" className="nav-link">
          פורום
        </Link>
        {user && (
          <Link to="/posts/new" className="nav-link">
            יצירת פוסט חדש
          </Link>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="welcome-text">שלום, {user.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              התנתק
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link login-link">
              התחבר
            </Link>
            <Link to="/register" className="nav-link register-link">
              הרשם
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
