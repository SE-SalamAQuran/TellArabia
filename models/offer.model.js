const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    price: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    service: {
        type: mongoose.Types.ObjectId,
        ref: 'Sub',
    },
    orders: {
        type: [mongoose.Types.ObjectId],
        ref: 'Order',
        default: []
    },

}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);