function SettingsPopup({ theme, toggleTheme }) {
    return (
      <div className="settings-popup">
        <h4>Settings</h4>
        <label><input type="checkbox" /> Allow Notifications</label>
        <label><input type="checkbox" /> Allow Location</label>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button onClick={() => {
          logout();
          window.location.reload();
        }}>🚪 Logout</button>
      </div>
    );
  }
  
  export default SettingsPopup;