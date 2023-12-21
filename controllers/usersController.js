
const User = require('../models/users'); 
const jwt = require('jsonwebtoken');

// Controller function for user registration
const register = async (req, res) => {
  try {
    // Extracting user information from the request body
    const { username, email, password, createdAt } = req.body;

    // Creating a new User instance with the provided information
    const user = new User({ username, email, password, createdAt: new Date() });

    // Saving the user to the database
    await user.save();

    // Sending a success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function for user login
const login = async (req, res) => {
  try {
    // Extracting username and password from the request body
    const { username, password } = req.body;

    // Finding a user with the provided username in the database
    const user = await User.findOne({ username });

    // Checking if the user exists and comparing the password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generating a JSON Web Token (JWT) for authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '72h' });

    // Sending the token in the response
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exporting the register and login functions
module.exports = {
  register,
  login,
};