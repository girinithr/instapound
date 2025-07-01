import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import Header from "./Header";
import { UserContext } from "./UserContext";
import "./Profile.css";

const fetcher = (url) => fetch(url).then(res => res.json());

function Profile() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const { data, error } = useSWR(
    user ? `https://dummyjson.com/posts/user/${user.id}` : null,
    fetcher
  );

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const [editPostId, setEditPostId] = useState(null);
  const [editContent, setEditContent] = useState({ title: "", body: "" });

  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.image || "");
  const fileInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (data?.posts) {
      const updated = data.posts.map(post => ({
        ...post,
        userImage: profileImage
      }));
      setPosts(updated);
    }
  }, [data, profileImage]);

  const handleNewPost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    const newEntry = {
      id: Date.now(),
      title: newPost.title,
      body: newPost.body,
      userImage: profileImage,
    };

    setPosts([newEntry, ...posts]);
    setNewPost({ title: "", body: "" });
  };

  const handleDelete = (id) => {
    setPostToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setPosts(posts.filter((post) => post.id !== postToDelete));
    setPostToDelete(null);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setPostToDelete(null);
    setShowDeleteModal(false);
  };

  const handleEdit = (post) => {
    setEditPostId(post.id);
    setEditContent({ title: post.title, body: post.body });
  };

  const handleSaveEdit = (id) => {
    setPosts(posts.map((post) => post.id === id ? { ...post, ...editContent } : post));
    setEditPostId(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        setProfileImage(newImage);
        setPosts(prev => prev.map(post => ({
          ...post,
          userImage: newImage
        })));
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  if (!user) return null;
  if (error) return <div>⚠️ Failed to load your posts.</div>;
  if (!data) return <div>⏳ Loading your posts...</div>;

  return (
    <div className="profile-container">
      <Header onProfileClick={handleProfileClick} />
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-image-wrapper" onClick={() => setShowImageModal(true)}>
            <img src={profileImage || "/default-user.png"} alt={user.username} className="profile-image" />
          </div>
          <div className="profile-text">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="create-post">
          <h3>Create New Post</h3>
          <input
            type="text"
            placeholder="Post title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Post body"
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
          />
          <button onClick={handleNewPost}>Post</button>
        </div>

        <h3>My Posts</h3>
        <div className="grid-posts">
          {posts.map((post) => (
            <div key={post.id} className="post-box">
              {editPostId === post.id ? (
                <>
                  <input
                    type="text"
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                  />
                  <textarea
                    value={editContent.body}
                    onChange={(e) => setEditContent({ ...editContent, body: e.target.value })}
                  />
                  <button onClick={() => handleSaveEdit(post.id)}>Save</button>
                  <button onClick={() => setEditPostId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <div className="post-user">
                    <img src={post.userImage || "/default-user.png"} alt="user" />
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.body}</p>
                  <button onClick={() => handleEdit(post)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(post.id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          ))}
        </div>

        {showImageModal && (
          <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={profileImage} alt="Profile Large" className="modal-image" />
              <button className="edit-image-btn" onClick={() => fileInputRef.current.click()}>
                Edit Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this post?</p>
              <div style={{ marginTop: "1rem" }}>
                <button className="confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
                <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
