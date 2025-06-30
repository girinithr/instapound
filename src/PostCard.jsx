import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import './styles/PostCard.css';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function PostCard({
  post,
  onClick,
  onProfileClick,
}) {
  const { data: user } = useSWR(`https://dummyjson.com/users/${post.userId}`, fetcher);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.reactions?.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(post.reactions?.dislikes || 0);

  const storageKey = `reaction-post-${post.id}`;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored) {
      setLiked(stored.liked);
      setDisliked(stored.disliked);
      setLikesCount(post.reactions.likes + (stored.liked ? 1 : 0));
      setDislikesCount(post.reactions.dislikes + (stored.disliked ? 1 : 0));
    } else {
      setLikesCount(post.reactions.likes);
      setDislikesCount(post.reactions.dislikes);
    }
  }, [post]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikesCount(likesCount - 1);
      localStorage.setItem(storageKey, JSON.stringify({ liked: false, disliked: false }));
    } else {
      setLiked(true);
      if (disliked) setDislikesCount(dislikesCount - 1);
      setDisliked(false);
      setLikesCount(likesCount + 1);
      localStorage.setItem(storageKey, JSON.stringify({ liked: true, disliked: false }));
    }
  };

  const handleDislike = (e) => {
    e.stopPropagation();
    if (disliked) {
      setDisliked(false);
      setDislikesCount(dislikesCount - 1);
      localStorage.setItem(storageKey, JSON.stringify({ liked: false, disliked: false }));
    } else {
      setDisliked(true);
      if (liked) setLikesCount(likesCount - 1);
      setLiked(false);
      setDislikesCount(dislikesCount + 1);
      localStorage.setItem(storageKey, JSON.stringify({ liked: false, disliked: true }));
    }
  };

  return (
    <div className="post-card" onClick={() => onClick(post.id)}>
      <div className="post-header">
        <div className="user-info">
          <img
            src={user?.image || 'https://via.placeholder.com/40'}
            alt={user?.firstName || 'User'}
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(user);
            }}
            className="profile-img"
          />
          <span>{user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`}</span>
        </div>
      </div>

      <div className="post-content">
        <h4>{post.title}</h4>
        <p>{post.body.slice(0, 100)}...</p>
      </div>

      <div className="post-actions">
        <button className="like-btn" onClick={handleLike}>
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>
        <button className="dislike-btn" onClick={handleDislike}>
          {disliked ? '👎' : '👎🏼'} {dislikesCount}
        </button>
      </div>
    </div>
  );
}
