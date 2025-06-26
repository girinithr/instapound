function PostCard({ post, onClick, refProp }) {
    return (
      <div className="post-card" ref={refProp} onClick={onClick}>
        <div className="user-info">
          <img src={post.user?.image} alt={post.user?.firstName} />
          <span>{post.user?.firstName} {post.user?.lastName}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.body.slice(0, 100)}...</p>
      </div>
    );
  }
  
  export default PostCard;
  