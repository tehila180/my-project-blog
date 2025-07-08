import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

// קומפוננטת תגובות
function CommentList({ comments }) {
  if (!comments || comments.length === 0) return <p>אין תגובות להצגה.</p>;

  return (
    <div>
      <h4>תגובות:</h4>
      {comments.map(comment => {
        // דיבוג - רואים את כל האובייקט תגובה ומחבר
        console.log('תגובה:', comment);

        // תנאי הגנה - אם author אובייקט עם username, מציגים אותו, אחרת "משתמש לא ידוע"
        const authorName = comment.author && comment.author.username ? comment.author.username : 'משתמש לא ידוע';

        return (
          <div key={comment._id} style={{ borderBottom: '1px solid #ddd', padding: '8px 0' }}>
            <p>{comment.content}</p>
            <small>מאת: {authorName} - {new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        );
      })}
    </div>
  );
}

function PostDetails({ id }) {
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('פוסט שהתקבל:', res.data); // דיבוג
        setPost(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleAddComment = async e => {
    e.preventDefault();
    if (!commentContent.trim()) {
      setError('אנא הכנס תוכן תגובה');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/posts/${id}/comments`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('תגובה חדשה שהתווספה:', res.data); // דיבוג

      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
      setCommentContent('');
      setError('');
    } catch (err) {
      setError('שגיאה בהוספת תגובה');
      console.error(err);
    }
  };

  if (loading) return <p>טוען פוסט...</p>;
  if (!post) return <p>הפוסט לא נמצא</p>;

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <hr />

      <CommentList comments={post.comments || []} />

      {user ? (
        <form onSubmit={handleAddComment} style={{ marginTop: 20 }}>
          <textarea
            rows={3}
            placeholder="הוסף תגובה..."
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ marginTop: 8 }}>
            הוסף תגובה
          </button>
        </form>
      ) : (
        <p>כדי להוסיף תגובה, יש להתחבר למערכת.</p>
      )}
    </div>
  );
}

export default PostDetails;
