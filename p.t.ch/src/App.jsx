import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import './global.css'; // ✅ יבוא של הרקע הכללי עם overlay

import Login from './pages/Login';
import Register from './pages/Register';
import PostsList from './pages/PostsList';
import PostForm from './pages/PostForm';
import PostDetails from './pages/PostDetails';
import EditPost from './pages/EditPost';
import Navbar from './components/Navbar';

export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    };

    checkUser();

    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {/* ✅ שכבת הטשטוש לכל הדפים */}
      <div className="global-overlay" />

      <Navbar />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/posts" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/posts" />} />
        <Route path="/posts" element={user ? <PostsList /> : <Navigate to="/login" />} />
        <Route path="/posts/new" element={user ? <PostForm /> : <Navigate to="/login" />} />
        <Route path="/posts/edit/:id" element={user ? <EditPost /> : <Navigate to="/login" />} />
        <Route path="/posts/:id" element={user ? <PostDetails /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/posts" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
