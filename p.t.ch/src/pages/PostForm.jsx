import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import './PostForm.css';

function PostForm() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return; // אם אין id לא נטען פוסט

    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // בדיקת הרשאות
        if (res.data.author._id.toString() !== user._id.toString()) {
          alert('אין לך הרשאה לערוך את הפוסט הזה');
          navigate('/posts');
          return;
        }

        setTitle(res.data.title);
        setContent(res.data.content);

        if (res.data.imageUrl) {
          setPreviewImage(`http://localhost:5000${res.data.imageUrl}`);
        }
      } catch (err) {
        setError('לא ניתן לטעון את הפוסט');
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('אנא מלאי את כל השדות');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('אנא התחבר/י כדי לשמור פוסט');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      if (image) {
        formData.append('image', image);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (id) {
        await axios.put(`http://localhost:5000/api/posts/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/posts', formData, config);
      }

      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשמירת הפוסט');
    }
  };

  return (
    <div className="post-form-container">
      <h2>{id ? 'עריכת פוסט' : 'יצירת פוסט חדש'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="כותרת"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="תוכן הפוסט"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          rows={8}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* תצוגה מקדימה של התמונה */}
        {previewImage && (
          <img
            src={previewImage}
            alt="תצוגה מקדימה"
            style={{
              marginTop: 10,
              maxWidth: '100%',
              maxHeight: 250,
              borderRadius: 8,
              objectFit: 'cover',
            }}
          />
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit">שמור</button>
      </form>
    </div>
  );
}

export default PostForm;
