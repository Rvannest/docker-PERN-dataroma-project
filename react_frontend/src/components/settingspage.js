// SettingsPage.js

import React from 'react';

function SettingsPage({ setCurrentPage, userRole }) {
  //Add state for form inputs
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
  
    // Get token from local storage
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // token to the Authorization header
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });
  
      if (response.ok) {
        await response.json();
        alert('Password changed successfully');
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };


  return (
    <div className="login-container">
      <h1>Settings/Change Password</h1>
      <form onSubmit={handleSubmit} className='login-form'>
        <label htmlFor="oldPassword">Old Password:</label>
        <input
          id="oldPassword"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label htmlFor="newPassword">New Password:</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label htmlFor="confirmPassword">Confirm New Password:</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className='signup-button'>Change Password</button>
      </form>
      <button onClick={() => setCurrentPage('stocks')} className='signup-button'>Back to Stocks</button>
    </div>
  );
}

  export default SettingsPage;