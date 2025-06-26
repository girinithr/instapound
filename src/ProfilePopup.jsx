function ProfilePopup({ user, logout, showMyPosts, setShowMyPosts }) {
    return (
      <div className="profile-popup">
        <p><strong>{user?.firstName} {user?.lastName}</strong></p>
        <p>{user?.email}</p>
        <button onClick={() => setShowMyPosts(prev => !prev)}>
          {showMyPosts ? 'All Posts' : 'My Posts'}
        </button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
  
  export default ProfilePopup;