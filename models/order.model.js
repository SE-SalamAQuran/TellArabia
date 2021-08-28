const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    attachments: {
        type: [String], //Array of attachments' URLs
        required: true,
        maxlength: 6
    },
    deadline: {
        type: Date,
        required: true,
    }

}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);