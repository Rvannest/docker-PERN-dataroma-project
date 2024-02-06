
// App.js
import React, { useState } from 'react';
import StocksTable from './components/stockstable';
import SignUp from './components/signup';
import SettingsPage from './components/settingspage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        const { token, roleId } = responseData;
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setUserRole(roleId);
        setCurrentPage('stocks');
      } else {
        alert('Login failed!');
      }
    } catch (error) {
      console.error('Login request failed', error);
      alert('Login request failed');
    }
  };

  const handleSignUpRedirect = () => {
    setCurrentPage('signup');
  };

  return (
    <div className="login-container">
      {currentPage === 'home' && !isLoggedIn && (
        <>
          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          <button onClick={handleSignUpRedirect} className='signup-button'>Sign Up</button>
        </>
      )}

      {currentPage === 'signup' && (<SignUp setCurrentPage={setCurrentPage} />)}

      {isLoggedIn && currentPage === 'stocks' && (
        <StocksTable userRole={userRole} setCurrentPage={setCurrentPage} />
      )}

      {isLoggedIn && currentPage === 'settings' && (
        <SettingsPage setCurrentPage={setCurrentPage} userRole={userRole} />
      )}
    </div>
  );
}

export default App;