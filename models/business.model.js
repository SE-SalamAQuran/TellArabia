const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const businessSchema = new Schema({ //Freelancer Schema

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

    offers: {
        type: [mongoose.Types.ObjectId],
        ref: 'Offer',
        default: [],
    },
    userInfo: { //Contains address + other info stored in user model
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true })

const Business = mongoose.model("Business", businessSchema);
module.exports = Business;