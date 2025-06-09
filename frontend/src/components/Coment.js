// src/components/Comments.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import TaskService from '../services/TaskService';

const Comments = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  // Determine if current user can comment (non-viewers)
  const canComment = user && user.role !== 'Viewer';

  useEffect(() => {
    // Load comments for this task
    const fetchComments = async () => {
      try {
        const data = await TaskService.getComments(taskId);
        setComments(data);
      } catch (err) {
        console.error('Failed to fetch comments', err);
      }
    };
    fetchComments();
  }, [taskId]);

  const handlePostComment = async () => {
    if (!canComment || !text.trim()) return;
    try {
      const comment = await TaskService.postComment(taskId, { text, author: user.name });
      setComments(prev => [...prev, comment]);
      setText('');
    } catch (err) {
      console.error('Posting comment failed', err);
    }
  };

  return (
    <div className="comments-section">
      <h4>Comments</h4>
      <ul className="comment-list">
        {comments.map((c, idx) => (
          <li key={idx}><strong>{c.author}:</strong> {c.text}</li>
        ))}
      </ul>
      {canComment && (
        <div className="add-comment">
          <input
            type="text"
            placeholder="Add a comment"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button onClick={handlePostComment}>Post Comment</button>
        </div>
      )}
    </div>
  );
};

export default Comments;
