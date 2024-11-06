var jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accesstoken = jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, process.env.Access_JWT_SECRET, { expiresIn: '2m' });
    const refreshtoken = jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role
    }, process.env.Refresh_JWT_SECRET, { expiresIn: '7d' });
    return { accesstoken, refreshtoken };
}

module.exports = generateTokens;