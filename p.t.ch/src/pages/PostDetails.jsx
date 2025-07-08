import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useParams } from 'react-router-dom';
import './PostDetails.css'; // קובץ העיצוב

function CommentList({ comments }) {
  if (!comments || comments.length === 0) return <p>אין תגובות להצגה.</p>;
  return (
    <div className="comments-section">
      <h4>תגובות:</h4>
      {comments.map(comment => (
        <div className="comment-box" key={comment._id}>
          <p className="comment-author">🗨️ {comment.author.username}</p>
          <p className="comment-content">{comment.content}</p>
          <small>{new Date(comment.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

function AddCommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) {
      setError('אנא הכנס תוכן תגובה');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCommentAdded(res.data);
      setContent('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהוספת תגובה');
    }
  };

  if (!user) return <p>כדי להוסיף תגובה יש להתחבר למערכת.</p>;

  return (
    <form onSubmit={handleSubmit} className="add-comment-form">
      <textarea
        placeholder="הוסף תגובה..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
      />
      {error && <p className="error-message">{error}</p>}
      <button type="submit">הוסף תגובה</button>
    </form>
  );
}

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleCommentAdded = newComment => {
    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));
  };

  if (loading) return <p>טוען פוסט...</p>;
  if (!post) return <p>הפוסט לא נמצא</p>;

  return (
    <div className="post-container">
  <h2 style={{
    fontWeight: '700',
    fontSize: '2rem',
    color: 'rgb(0, 0, 0)',
    marginBottom: '15px',
   textShadow: '4px 4px 8px rgba(0, 0, 0, 0.35)',
  }}>
    {post.title}
  </h2>
 

    {post.imageUrl && (
  <div className="post-image-wrapper">
    <img
      src={`http://localhost:5000${post.imageUrl}`}
      alt="תמונה בפוסט"
      className="post-image"
    />
  </div>
)}


       <p style={{ fontSize: '20px', lineHeight: '1.6'  ,  textShadow: '4px 4px 8px rgba(0, 0, 0, 0.35)', color: '#333' }}>
  {post.content}
</p>
      
      <hr />
      <CommentList comments={post.comments} />
      <AddCommentForm postId={post._id} onCommentAdded={handleCommentAdded} />
    </div>
  );
}

export default PostDetails;
