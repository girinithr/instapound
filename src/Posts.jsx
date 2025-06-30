import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { UserContext } from './UserContext';
import PostCard from './PostCard';
import PostDetail from './PostDetail';
import './styles/Posts.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Posts() {
  const { user } = useContext(UserContext);

  const { data: postData, error: postError } = useSWR(`https://dummyjson.com/posts?limit=150`, fetcher);
  const { data: userData, error: userError } = useSWR(`https://dummyjson.com/users?limit=100`, fetcher);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState('all');

  const allPosts = useMemo(() => {
    if (!postData?.posts || !userData?.users) return [];

    const userMap = {};
    userData.users.forEach(user => {
      userMap[user.id] = user;
    });

    return postData.posts.map(post => ({
      ...post,
      user: userMap[post.userId] || null
    }));
  }, [postData, userData]);

  const handleLike = (postId) => {
    setLikedPosts((prev) => {
      const updated = { ...prev };
      if (updated[postId] === 'like') delete updated[postId];
      else updated[postId] = 'like';
      return updated;
    });
  };

  const handleDislike = (postId) => {
    setLikedPosts((prev) => {
      const updated = { ...prev };
      if (updated[postId] === 'dislike') delete updated[postId];
      else updated[postId] = 'dislike';
      return updated;
    });
  };

  const search = searchText.toLowerCase();

  const textMatch = (post) =>
    post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search);

  const userMatch = (post) => {
    const fullName = `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.toLowerCase();
    return fullName.includes(search);
  };

  const filteredPosts = allPosts.filter((post) => {
    if (!search) return true;
    if (searchMode === 'all') return textMatch(post) || userMatch(post);
    if (searchMode === 'user') return userMatch(post);
    if (searchMode === 'text') return textMatch(post);
    return true;
  });

  if (postError || userError)
    return <div className="error-message">🚫 Failed to load posts or users.</div>;

  if (!postData || !userData)
    return <div className="loading-message">⏳ Loading posts and users...</div>;

  return (
    <div className="posts-wrapper">
      {!selectedPostId && (
        <>
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search posts or users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
            />
            {searchText && (
              <button className="clear-btn" onClick={() => setSearchText('')}>
                ❌
              </button>
            )}
          </div>

          <div className="search-filters">
            <button onClick={() => setSearchMode('all')} className={searchMode === 'all' ? 'active' : ''}>All</button>
            <button onClick={() => setSearchMode('user')} className={searchMode === 'user' ? 'active' : ''}>User</button>
            <button onClick={() => setSearchMode('text')} className={searchMode === 'text' ? 'active' : ''}>Text</button>
          </div>

          <div className="posts-container">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={(id) => setSelectedPostId(id)}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  likedState={{
                    liked: likedPosts[post.id] === 'like',
                    disliked: likedPosts[post.id] === 'dislike',
                  }}
                />
              ))
            ) : (
              <div className="no-results">🚫 No posts found matching your search.</div>
            )}
          </div>
        </>
      )}

      {selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          goBack={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
