import { useState } from 'react';

function CommentSection({ comments, setComments }) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const myComment = {
      id: Date.now(),
      body: newComment,
      user: { username: 'you' },
    };
    setComments(prev => [...prev, myComment]);
    setNewComment('');
  };

  return (
    <div className="comment-section">
      <div className="comments-list">
        {comments.map((c, i) => (
          <div key={`c-${i}`} className="comment">
            <strong>{c.user?.username || 'User'}</strong>: {c.body}
          </div>
        ))}
      </div>
      <div className="comment-input">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleAddComment}>Post</button>
      </div>
    </div>
  );
}

export default CommentSection;
