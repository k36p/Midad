const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const messages = require('../config/msg.json');
const { check,validationResult } = require('express-validator');


// create new account 
router.post('/register',[ check('username', messages.ar.USERNAME_REQUIERD).not().isEmpty(), 
        check('email',  messages.ar.EMAIL_REQUIERD).isEmail(),
        check('password', messages.ar.MIN_CHAR_PASSWORD).isLength({
            min: 8})], async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }

            const {username, email, password, specialization, gender} = req.body;
 
            if(username.length < 3){ // check length
                 return res.status(400).json({
                    message: messages.ar.MIN_CHAR_USERNAME
                });
            }

            let user = await User.findOne({ // check emails data
                email
            });

            if (user) { // true -_- !!
                return res.status(400).json({
                    message: messages.ar.UNAVALIABLE_EMAIL
                });
            }

            user = await User.findOne({ // check usernames data
                username
            });

            if (user) { // true -_- !!
                return res.status(400).json({
                    message: messages.ar.UNAVALIABLE_USERNAME
                });
            }

            user = new User({username, email, password, specialization, gender });

            await user.save(); // save new User

            const payload = { 
                user: {
                    id: user.id
                }
            };

            // auto login after registier
            jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3d'},
                (err, token) => {
                    if (err) {
                        console.error('JWT signing error:', err);
                        return res.status(500).json({
                            message: messages.ar.ERROR_CREATE_ACCOUNT
                        });
                    }

                    // Set the token as an HTTP-only cookie
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,//process.env.NODE_ENV === 'production', 
                        sameSite: 'Lax', // Adjust as needed, 'Strict' or 'None' (with secure)
                        maxAge: 3 * 24 * 60 * 60 * 1000  
                    }); 
                    res.redirect('/');
                }
            );
        } catch (err) {
            console.error('Registration error:', err.message);
            res.status(500).json({
                message: message.ar.ERROR_CREATE_ACCOUNT,
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }
);

// login to account
router.post('/login',[check('email', messages.ar.EMAIL_REQUIERD).isEmail(),
    check('password', messages.ar.PASSOWRD_REQUIERD).exists()
    ],
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }

            const {email, password} = req.body;

            let user = await User.findOne({ // check emails data
                email
            });

            if (!user) {
                return res.status(400).json({
                    message: messages.ar.INVALID_DATA
                });
            }

            const isMatch = await user.matchPassword(password); // compare data

            if (!isMatch) {
                return res.status(400).json({
                    message: messages.ar.INVALID_DATA
                });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3d'},
                (err, token) => {
                    if (err) {
                        console.error('JWT signing error:', err);
                        return res.status(500).json({
                            message: messages.ar.ERROR_CREATE_ACCOUNT      
                        });
                    }

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,//process.env.NODE_ENV === 'production', 
                        sameSite: 'Lax',
                        maxAge: 3 * 24 * 60 * 60 * 1000
                    });
                   
            res.redirect('/'); // you'r welcome :)
            
                }
            );

        } catch (err) {
            console.error('Login error:', err.message);
            res.status(500).json({
                message: messages.ar.ERROR_CREATE_ACCOUNT
            });
        }
    }
);

// fuck off
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('token');
        res.redirect("/")
    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({
            message: messages.ar.ERROR_LOGOUT
        });
    }
});

//  
router.post('/verify-token', (req, res) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                message: messages.en.UNDEFIEND_TOKEN,
                valid: false
            });
        }
            
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.json({
            message: messages.en.TOKEN_VALID,
            valid: true,
            userId: decoded.user.id
        });
        
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({
            message: messages.en.INVALID_TOKEN,
            valid: false
        });
    }
});

module.exports = router;