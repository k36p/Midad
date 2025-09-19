const jwt = require('jsonwebtoken'); 
const User = require('../models/User');

module.exports = async function AccessPanel(req, res, next) {
  try {
    // Retrieve JWT token from cookie
    const jwtToken = req.cookies.token;
    
    if (!jwtToken) {
      return res.redirect("/login");
    }
    
    // Verify JWT token
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const username = decoded.user;

    let userData = await User.findById({ _id: decoded.user.id });

    if(userData.role === "admin"){
    req.user = username;
    next();
    }else{
      return res.status(403).send('Access denied');
    }
  } catch (error) {
    console.error('Authorization error:', error);
    res.redirect("/login");
  }
}


