// PostDetail.jsx
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import CommentSection from './CommentSection';
import './styles/PostDetail.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

function PostDetail({ postId, goBack }) {
  const { data: postData } = useSWR(`https://dummyjson.com/posts/${postId}`, fetcher);
  const [reaction, setReaction] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  useEffect(() => {
    if (postData?.reactions) {
      setLikes(postData.reactions.likes || 0);
      setDislikes(postData.reactions.dislikes || 0);
    }
  }, [postData]);

  const toggleLike = () => {
    if (reaction === 'like') {
      setReaction(null);
      setLikes((prev) => prev - 1);
    } else {
      setReaction('like');
      setLikes((prev) => prev + 1);
      if (reaction === 'dislike') setDislikes((prev) => prev - 1);
    }
  };

  const toggleDislike = () => {
    if (reaction === 'dislike') {
      setReaction(null);
      setDislikes((prev) => prev - 1);
    } else {
      setReaction('dislike');
      setDislikes((prev) => prev + 1);
      if (reaction === 'like') setLikes((prev) => prev - 1);
    }
  };

  if (!postData) return <p>Loading...</p>;

  return (
    <div className="post-detail">
      <div className="left-pane">
        <button onClick={goBack}>⬅ Back</button>
        <h2>{postData.title}</h2>
        <p>{postData.body}</p>
      </div>
      <div className="right-pane">
        <div className="likes">
          <button
            onClick={toggleLike}
            className={`like-btn ${reaction === 'like' ? 'active' : ''}`}
          >
            {reaction === 'like' ? '❤️' : '🤍'} {likes}
          </button>
          <button
            onClick={toggleDislike}
            className={`dislike-btn ${reaction === 'dislike' ? 'active' : ''}`}
          >
            👎 {dislikes}
          </button>
        </div>
        <div className="comment-wrapper">
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
