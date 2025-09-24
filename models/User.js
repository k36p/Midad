const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { type } = require('os');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },  email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, 
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }, 
    specialization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialization',
        required: true
    },
    role:{
        type: String,
        default:"user"
    },
    gender:{
        type:String,
        default:"male"
    },
        createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware لتجزئة كلمة المرور قبل حفظها
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method لمقارنة كلمة المرور المدخلة مع كلمة المرور المجزأة
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);