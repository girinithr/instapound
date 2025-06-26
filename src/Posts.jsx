import { useEffect, useState, useRef, useCallback } from 'react';
import './Posts.css';
import PostCard from './PostCard';
import ProfilePopup from './ProfilePopup';
import SettingsPopup from './SettingsPopup';
import PostDetail from './PostDetail';

function Posts({ loggedInUser }) {
  const [posts, setPosts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');
  const [viewMyPosts, setViewMyPosts] = useState(false);

  const observer = useRef();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme === 'light' ? 'light-theme' : 'dark-theme';
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`https://dummyjson.com/posts?limit=6&skip=${skip}`);
      const data = await res.json();

      const postsWithUsers = await Promise.all(
        data.posts.map(async (post) => {
          const userRes = await fetch(`https://dummyjson.com/users/${post.userId}`);
          const userData = await userRes.json();
          return { ...post, user: userData };
        })
      );

      setPosts((prev) => [...prev, ...postsWithUsers]);
      setSkip((prev) => prev + 6);
      if (skip + 6 >= data.total) setHasMore(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    if (!initialLoadDone) {
      fetchPosts().then(() => {
        setInitialLoadDone(true);
        setTimeout(() => window.scrollTo(0, 0), 100); 
      });
    }
  }, [initialLoadDone]);

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!hasMore || !initialLoadDone || viewMyPosts) return;

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, skip, initialLoadDone, viewMyPosts]
  );

  const logout = () => {
    window.location.reload();
  };

  const filteredPosts = viewMyPosts
    ? posts.filter((p) => p.user.id === loggedInUser.id)
    : posts;

  return (
    <div className="main-container">
      <header className="app-header">
        <div className="logo">📸 MyGram</div>
        <div className="header-buttons">
          <button onClick={() => setShowProfile(!showProfile)}>👤</button>
          <button onClick={() => setShowSettings(!showSettings)}>⚙️</button>
        </div>
        {showProfile && (
          <ProfilePopup
            user={loggedInUser}
            logout={logout}
            showMyPosts={viewMyPosts}
            setShowMyPosts={setViewMyPosts}
          />
        )}
        {showSettings && <SettingsPopup theme={theme} toggleTheme={toggleTheme} />}
      </header>

      {!selectedPost && (
        <div className="posts-container">
          {filteredPosts.map((post, index) => (
            <PostCard
              key={`post-${post.id}-${index}`}
              post={post}
              onClick={() => setSelectedPost(post)}
              refProp={index === filteredPosts.length - 1 && !viewMyPosts ? lastPostRef : null}
            />
          ))}
          {!hasMore && !viewMyPosts && <p style={{ textAlign: 'center' }}>✅ All posts loaded</p>}
          {viewMyPosts && filteredPosts.length === 0 && <p style={{ textAlign: 'center' }}>No posts yet.</p>}
        </div>
      )}

      {selectedPost && (
        <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

export default Posts;