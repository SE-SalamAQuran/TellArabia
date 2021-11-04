const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishListItemSchema = new Schema({

    date: {
        type: String,
        default: new Date().toISOString().slice(0, 10),
    },
    status: {
        type: String,
        enum: ["Pending", "In progress", "Removed", "Complete"],
        default: "Pending",
    },
    language: {
        type: String,
    },
    quality: {
        type: String,
        enum: ["A", "B", "C"],
    },
    deadline: {
        type: String,
        required: true,
    },
    information: {
        type: String,
        required: true,
    },
    warranty: {
        type: Boolean,
        required: true,
    },
    service: {
        type: mongoose.Types.ObjectId,
        ref: "Sub",
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("WishlistItem", wishListItemSchema);