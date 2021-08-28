const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 25
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 10,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid");
            }
        },
    },
    phone: {

        countryCode: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            unique: true,
            required: true,
            validate(value) {
                if (!validator.isMobilePhone(value)) {
                    throw new Error("Phone number is invalid");
                }
            },
        },

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
        required: true,
    },
    zipCode: {
        type: String,
        required: false,
        default: 0,

    },
    user_type: {
        type: Number,
        enum: [0, 1, 2], // 0: student, 1: business, 2: other
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = User;