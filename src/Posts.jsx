import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { UserContext } from './UserContext';
import PostCard from './PostCard';
import PostDetail from './PostDetail';
import './styles/Posts.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Posts() {
  const { user } = useContext(UserContext);

  const { data: userData, error: userError } = useSWR(`https://dummyjson.com/users?limit=150&skip=0`, fetcher);
  const { data: postData, error: postError } = useSWR(`https://dummyjson.com/posts?limit=150`, fetcher);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredUserPosts, setFilteredUserPosts] = useState([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // 👈

  const allPosts = useMemo(() => {
    if (!postData?.posts || !userData?.users) return [];
    const userMap = {};
    userData.users.forEach(user => { userMap[user.id] = user; });

    return postData.posts.map(post => ({
      ...post,
      user: userMap[post.userId] || null
    }));
  }, [postData, userData]);

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const updated = { ...prev };
      if (updated[postId] === 'like') delete updated[postId];
      else updated[postId] = 'like';
      return updated;
    });
  };

  const handleDislike = (postId) => {
    setLikedPosts(prev => {
      const updated = { ...prev };
      if (updated[postId] === 'dislike') delete updated[postId];
      else updated[postId] = 'dislike';
      return updated;
    });
  };

  const matchingUsers = useMemo(() => {
    const search = searchText.toLowerCase();
    if (!search || !userData?.users) return [];
    return userData.users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search)
    );
  }, [searchText, userData]);

  const handleUserClick = async (userId) => {
    setSearchingUser(true);
    const res = await fetch(`https://dummyjson.com/posts/user/${userId}`);
    const userPosts = await res.json();
    const user = userData.users.find(u => u.id === userId);
    const enriched = userPosts.posts.map((p) => ({ ...p, user }));
    setFilteredUserPosts(enriched);
    setSearchingUser(false);
    setShowSuggestions(false); // 👈 Hide suggestions only
  };

  const postsToRender = searchText && filteredUserPosts.length > 0 ? filteredUserPosts : allPosts;

  if (postError || userError) return <div className="error-message">🚫 Failed to load posts or users.</div>;
  if (!postData || !userData) return <div className="loading-message">⏳ Loading posts and users...</div>;

  return (
    <div className="posts-wrapper">
      {!selectedPostId && (
        <>
          <div className="search-bar-wrapper">
            <div className="search-box-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setFilteredUserPosts([]);
                  setShowSuggestions(true); // 👈 Show suggestions on typing
                }}
                className="search-bar"
              />
              {searchText && (
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSearchText('');
                    setFilteredUserPosts([]);
                    setShowSuggestions(false);
                  }}
                >
                  ❌
                </button>
              )}
              {searchText && matchingUsers.length > 0 && showSuggestions && (
                <div className="user-suggestions">
                  {matchingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="user-suggestion"
                      onClick={() => handleUserClick(u.id)}
                    >
                      <img src={u.image} alt={`${u.firstName}`} width={30} height={30} />
                      <span>{u.firstName} {u.lastName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {searchingUser && <p className="loading-message">🔍 Loading posts from selected user...</p>}

          <div className="posts-container">
            {postsToRender.length > 0 ? (
              postsToRender.map((post) => (
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
              <div className="no-results">🚫 No posts found.</div>
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
