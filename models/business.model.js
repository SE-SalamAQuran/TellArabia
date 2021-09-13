const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const businessSchema = new Schema({
    name: {
        type: String,
        required: true,

    },

    telephone: {
        type: String,
        unique: true,
        required: true,
    },
    crn: { //Company registration number
        type: String,
        required: true,
        minlength: 8,
        unique: true,
    },

    fax: {
        type: String,
        unique: true,
        required: true,

    },
    language: {
        type: String,
        default: ""
    },
    socialMediaURLs: {
        facebook: {
            type: String,
            unique: true,
            default: ""
        },
        twitter: {
            type: String,
            unique: true,
            default: "",

        },
        linkedIn: {
            type: String,
            unique: true,
            default: "",

        },
        website: {
            type: String,
            unique: true,
            default: ""

        },


    },

    industry: { //Business type
        type: String,
        required: true,
    },
    userInfo: { //Contains address + other info stored in user model
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true })

const Business = mongoose.model("Business", businessSchema);
module.exports = Business;