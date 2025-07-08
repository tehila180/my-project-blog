import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import './PostForm.css';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState(null); // כתובת התמונה הקיימת
  const [newImage, setNewImage] = useState(null); // תמונה חדשה אם נבחרה
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const post = res.data;

        if (post.author._id !== user._id) {
          alert('אין לך הרשאה לערוך את הפוסט הזה');
          navigate('/posts');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setCurrentImage(post.imageUrl ? `http://localhost:5000${post.imageUrl}` : null);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת הפוסט לעריכה:', err);
        alert('לא ניתן להציג את הפוסט');
        navigate('/posts');
      }
    };

    fetchPost();
  }, [id, user._id, navigate]);

  const handleImageChange = e => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);

      // אופציונלי: תצוגת תצוגה מקדימה של התמונה החדשה
      const reader = new FileReader();
      reader.onload = function (ev) {
        setCurrentImage(ev.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (newImage) {
        formData.append('image', newImage);
      }

      await axios.put(`http://localhost:5000/api/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      navigate('/posts');
    } catch (err) {
      console.error('שגיאה בעדכון הפוסט:', err);
      alert('שגיאה בעדכון הפוסט');
    }
  };

  if (loading) return <p>טוען את פרטי הפוסט...</p>;

  return (
    <div className="post-form-container">
      <h2>עריכת פוסט</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>כותרת:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>תוכן:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="6"
          />
        </div>

        <div>
          <label>תמונה נוכחית:</label>
          {currentImage ? (
            <img
              src={currentImage}
              alt="תמונה נוכחית"
              style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginBottom: 10, borderRadius: 8 }}
            />
          ) : (
            <p>אין תמונה בפוסט זה.</p>
          )}
        </div>

        <div>
          <label>שנה/העלה תמונה חדשה:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit">שמור שינויים</button>
      </form>
    </div>
  );
}

export default EditPost;
