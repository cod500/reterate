const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    role: {
        type: String,
        default: ''
    },
    image: {
        type: Buffer,
    },
    passwordResetToken: {
        type: String,
        default: ''
    },
    passwordResetExpire: {
        type: String,
        default: Date.now
    },
});

const User = mongoose.model('users', UserSchema, 'users');

module.exports = User;