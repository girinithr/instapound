import React, { useState, useContext } from 'react';
import useSWR from 'swr';
import { UserContext } from './UserContext';
import './styles/CommentSection.css';

const fetcher = url => fetch(url).then(res => res.json());

export default function CommentSection({ postId }) {
  const { user } = useContext(UserContext);
  const { data, mutate } = useSWR(`https://dummyjson.com/posts/${postId}/comments`, fetcher);

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const newC = {
      id: Date.now(),
      body: newComment,
      postId: parseInt(postId),
      user: {
        id: user?.id || 1,
        username: user?.firstName || 'You'
      }
    };

    // Optimistic UI update
    mutate(prev => ({
      ...prev,
      comments: [...(prev?.comments || []), newC]
    }), false);

    setNewComment('');

    await fetch(`https://dummyjson.com/comments/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: newC.body,
        postId: newC.postId,
        userId: newC.user.id
      }),
    });

    // Re-fetch to ensure latest server state
    
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;

    await fetch(`https://dummyjson.com/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editText })
    });

    mutate(prev => ({
      ...prev,
      comments: prev.comments.map(c =>
        c.id === commentId ? { ...c, body: editText } : c
      )
    }), false);

    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (commentId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
  if (!confirmDelete) return;

  await fetch(`https://dummyjson.com/comments/${commentId}`, {
    method: 'DELETE'
  });

  mutate(prev => ({
    ...prev,
    comments: prev.comments.filter(c => c.id !== commentId)
  }), false);

  setActiveMenuId(null);
};


  return (
    <div className="comment-section">
      <h4>Comments</h4>

      <div className="comments-list">
        {data?.comments?.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-top">
              <strong>{comment.user?.username || 'Anonymous'}</strong>
              {user?.id === comment.user?.id && (
                <div className="comment-menu">
                  <span
                    className="dots"
                    onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                  >
                    ⋮
                  </span>
                  {activeMenuId === comment.id && (
                    <div className="comment-actions">
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditText(comment.body);
                          setActiveMenuId(null);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(comment.id)}>Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {editingId === comment.id ? (
              <div className="edit-section">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="edit-buttons">
                  <button onClick={() => handleEdit(comment.id)}>Save</button>
                  <button onClick={() => {
                    setEditingId(null);
                    setEditText('');
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <span>{comment.body}</span>
            )}
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleAddComment}>Post</button>
      </div>
    </div>
  );
}
