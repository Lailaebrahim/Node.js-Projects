var jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '2m' });
}

module.exports = generateToken;