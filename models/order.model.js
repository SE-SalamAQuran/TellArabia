const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Service"
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
    status: {
        type: String,
        enum: ["Pending", "In progress", "Removed", "Complete"],
        default: "Pending",
    },
    attachments: [{
        type: String, //Array of attachments' URLs
        required: true,
    }],
    deadline: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);