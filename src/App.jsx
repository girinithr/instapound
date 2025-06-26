import { useState } from 'react';
import Login from './Login';
import Posts from './Posts';
import './App.css';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <div className="App">
      {!loggedInUser ? (
        <Login onLogin={setLoggedInUser} />
      ) : (
        <Posts loggedInUser={loggedInUser} />
      )}
    </div>
  );
}

export default App;