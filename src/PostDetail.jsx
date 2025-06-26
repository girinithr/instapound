import { useEffect, useState } from 'react';
import CommentSection from './CommentSection';

function PostDetail({ post, onBack }) {
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(post.reactions?.likes || 0);

  useEffect(() => {
    fetch(`https://dummyjson.com/posts/${post.id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data.comments || []))
      .catch(() => setComments([]));
  }, [post.id]);

  return (
    <div className="post-detail">
      <div className="left-pane">
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <button onClick={onBack}>⬅ Back</button>
      </div>
      <div className="right-pane">
        <div className="likes">
          ❤️ {likes} likes | 💔 {post.reactions?.dislikes || 0} dislikes
        </div>
        <h4>Comments</h4>
        <CommentSection comments={comments} setComments={setComments} />
      </div>
    </div>
  );
}

export default PostDetail;
