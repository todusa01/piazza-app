const jwt = require('jsonwebtoken');
const User = require('../models/users'); 

const authMiddleware = async (req, res, next) => {
    try {
        // Check for the token in the Authorization header
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).send({ error: 'No token provided.'});
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user associated with the token
        const user = await User.findOne({ _id: decoded.userId, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        // Attach user and token to the request object
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate first.'});
    }
};

module.exports = authMiddleware;
