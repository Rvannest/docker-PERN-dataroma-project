
import React, { useState } from 'react';

function SignUp({ setCurrentPage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPaid, setIsPaid] = useState(false);
  
    const handleSignUp = async (event) => {
      event.preventDefault();
    
      // request body
      const body = JSON.stringify({
        username,
        password,
        roleId: isPaid ? 4 : null // null is for free users
      });
    
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body
      });
  
      if (response.ok) {
        // Sign up successful
        alert('Account creation successful');
        setCurrentPage('home');
      } else {
        if(response.status === 409){
          alert('This username is not available');
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    };
  
    return (
      <div className="login-container">
        <form onSubmit={handleSignUp} className='login-form'>
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

          <label htmlFor="isPaid" className="checkbox-custom-label">
          <p className='question-freetrial'>Would you like a Premium Free Trial?</p>
            <input
              id="isPaid"
              type="checkbox"
              className="checkbox-custom"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            <span className="checkbox-custom-control"></span>
          </label>

          <button type="submit" className='createAccount-button'>Create Account</button>
        </form>
      </div>
    );
  }

export default SignUp;