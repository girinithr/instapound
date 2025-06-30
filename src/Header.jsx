import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ onProfileClick, onSearch }) {
  const { user, setUser } = useContext(UserContext);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = user.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    document.body.className = newTheme;
    setUser({ ...user, theme: newTheme });
  };

 

  return (
    <header className="app-header">
      <div className="logo" onClick={() => navigate('/home')} style={{ cursor: "pointer" }}>
        📸 InstaPound
      </div>

      <div className="header-buttons">
        <button onClick={onProfileClick}>👤</button>
        <button onClick={() => setShowSettings(!showSettings)}>⚙️</button>
      </div>

      {showSettings && (
        <div className="settings-popup">
          <h4>Settings</h4>
          <label>
            <input type="checkbox" /> Allow Notifications
          </label>
          <label>
            <input type="checkbox" /> Allow Location
          </label>
          <button onClick={toggleTheme}>
            Switch to {user.theme === 'dark-theme' ? 'Light' : 'Dark'} Mode
          </button>
          <button onClick={() => {
          navigate('/');
          window.location.reload();
        }}>🚪 Logout</button>
        </div>
      )}
    </header>
  );
}
