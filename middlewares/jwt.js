const jwt = require('jsonwebtoken'); 
const messages = require('../config/msg.json');

module.exports = function(req, res, next) { 
    const token = req.header('token'); 
  
    if (!token) {
        return res.status(401).json({
            message: messages.en.UNDEFIEND_TOKEN
        });
    }

    try {
 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();  

    } catch (err) {
        res.status(401).json({
            message: messages.en.INVALID_TOKEN
        });
    }
};
