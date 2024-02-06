
require('dotenv').config(); //environment variables from .env file

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator');


const app = express();
app.use(express.json());

app.use(cors());

// initialize the PostgreSQL client
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

//Signup route with validation
app.post('/signup', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 5 characters long').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, roleId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, roleId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { //violation
      return res.status(409).send('Username already exists');
    }
    console.error(err);
    res.status(500).send('Server error during signup');
  }
});


app.post('/login', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    //Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).send('User does not exist');
    }

    // check if password is correct
    const isValid = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isValid) {
      return res.status(401).send('Invalid password');
    }

    // Create token (jwt)
    const token = jwt.sign({ userId: userResult.rows[0].user_id, roleId: userResult.rows[0].role_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // send token to the client
    res.status(200).json({ token, roleId: userResult.rows[0].role_id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login');
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; //token is sent in the authorization header
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};



// Change Password route
app.post('/change-password', authenticate, [

  check('oldPassword', 'Old password is required').not().isEmpty(),
  check('newPassword', 'New password must be at least 5 characters long').isLength({ min: 5 }),
  check('confirmNewPassword', 'Confirm new password is required').not().isEmpty(),
  //validation to check if new password and confirm new password match
  check('confirmNewPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('New passwords do not match');
    }
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    //fetch current hashed password from the database
    const userQuery = await pool.query('SELECT password FROM users WHERE user_id = $1', [userId]);
    if (userQuery.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    // Compare old password with the hashed password
    const isMatch = await bcrypt.compare(oldPassword, userQuery.rows[0].password);
    if (!isMatch) {
      return res.status(400).send('Old password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password successfully changed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




// Get all stocks route
app.get('/stocks', authenticate, async (req, res) => {
  let query;
  if (req.user.roleId === 4) { // Paid user
    query = 'SELECT * FROM six_month_buys ORDER BY buys DESC';
  } else { // Free user
    query = 'SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY id DESC) as rownum FROM six_month_buys) as ranked WHERE rownum <= 50';
  }

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error retrieving stocks');
  }
});

// startserver
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});