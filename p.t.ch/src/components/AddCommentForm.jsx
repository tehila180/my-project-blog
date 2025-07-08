import React, { useState } from 'react';
import axios from 'axios';

function AddCommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

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
      onCommentAdded(res.data); // מחזירים את התגובה שהתווספה למעלה
      setContent('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהוספת תגובה');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <textarea
        placeholder="הוסף תגובה..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: 8 }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ marginTop: 8 }}>
        הוסף תגובה
      </button>
    </form>
  );
}

export default AddCommentForm;
