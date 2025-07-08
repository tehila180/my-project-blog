import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';

function PostsList() {
  const { user, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('שגיאה בטעינת הפוסטים:', err);
      alert('שגיאה בטעינת הפוסטים');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('את בטוחה שאת רוצה למחוק את הפוסט?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(); // ריענון הרשימה אחרי מחיקה
    } catch (err) {
      console.error('שגיאה במחיקה:', err);
      alert('שגיאה במחיקת הפוסט');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) return <p>טוען פוסטים...</p>;

  return (
    <div style={{ maxWidth: 800, margin: 'auto', color: '#004080',  padding: 20 , }}>
       <h2
    style={{
      fontSize: '30px',  
      fontWeight: '700',   
      marginBottom: 15,
    }}
  >
    שלום, {user.username}
  </h2>
     

      <h3>רשימת פוסטים:</h3>
      {posts.length === 0 ? (
        <p>אין פוסטים להצגה.</p>
      ) : (
        posts.map(post => {
          const authorId = post.author?._id
            ? post.author._id.toString()
            : post.author.toString();
          const userId = user._id.toString();

          return (
            <div
              key={post._id}
              style={{
               
                backgroundColor: 'rgba(255, 255, 255, 0.64)', // לבן שקוף
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.38)', // כדי להבליט את הקופסא
              }}
            >
              <h4>{post.title}</h4>

  

              {/* תמונה ממוזערת אם קיימת */}
              {post.imageUrl && (
                <img
                  src={`http://localhost:5000${post.imageUrl}`}
                  alt="תמונה מהפוסט"
                  style={{
                    maxWidth: '170px',
                    maxHeight: '180px',
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 10,
                    display: 'block',
                  }}
                />
              )}

              <p>{post.content}</p>
              {/* הוספת תאריך ושעה */}
  <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '-8px', marginBottom: '10px' }}>
    פורסם ב: {new Date(post.createdAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
  </p>
              <small>מאת: {post.author?.username || post.author}</small>
              <br />
              
              <Link to={`/posts/${post._id}`}>הוספת תגובה </Link>

              {authorId === userId && (
                <>
                  <br />
                 <Link to={`/posts/edit/${post._id}`}>
  <button style={{
    marginTop: 5,
    padding: '4px 10px',
    fontSize: '14px',
    backgroundColor: '#e6f2ff',
    border: '1px solid #3399ff',
    color: '#004080',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px'
  }}>
    ✏️ ערוך
  </button>
</Link>

<button
  onClick={() => handleDelete(post._id)}
  style={{
    marginTop: 5,
    padding: '4px 10px',
    fontSize: '14px',
    backgroundColor: '#ffe6e6',
    border: '1px solid #cc0000',
    color: '#800000',
    borderRadius: '6px',
    cursor: 'pointer'
  }}
>
  🗑️ מחק
</button>


                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PostsList;
