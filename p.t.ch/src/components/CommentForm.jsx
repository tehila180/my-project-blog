import React, { useState } from 'react';
import axios from 'axios';

function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) {
      setError('אנא מלא תוכן תגובה');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContent('');
      setError('');
      if (onCommentAdded) onCommentAdded(res.data);  // מעבירה את התגובה החדשה עם הפרטים שלה
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשליחת תגובה');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
      <textarea
        rows={3}
        placeholder="כתוב תגובה..."
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ padding: '6px 12px' }}>
        שלח תגובה
      </button>
    </form>
  );
}

export default CommentForm;
