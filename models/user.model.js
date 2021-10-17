const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 25
    },

    phone: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },

    city: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: ""
    },
    zipCode: {
        type: String,
        required: false,
        default: 0,

    },
    meetings: {
        type: [mongoose.Types.ObjectId],
        ref: 'Meeting',
        default: [],
    },
    complaints: {
        type: [mongoose.Types.ObjectId],
        ref: 'Complaint',
        default: [],
    },
    user_type: {
        type: Number,
        enum: [0, 1, 2], // 0: student, 1: business / freelancer, 2: Employee 
    },
    is_active: {
        type: Boolean,
        default: false,
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ""
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User;