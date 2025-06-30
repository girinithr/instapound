import { useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

import Header from "./Header";
import Posts from "./Posts";
import Profile from "./Profile";

import "./App.css";

export default function App() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className={`main-container ${user?.theme || 'light-theme'}`}>
      <Header onProfileClick={handleProfileClick} />

      <Routes>
        <Route path="/home" element={<Posts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Posts />} />
      </Routes>
    </div>
  );
}
