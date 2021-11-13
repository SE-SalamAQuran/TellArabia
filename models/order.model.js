const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    language: {
        type: String,
        required: true,
    },
    offer: {
        type: mongoose.Types.ObjectId,
        ref: 'Offer',

    },
    details: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Removed", "Complete"],
        default: "Pending",
    },

    deadline: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    complaints: {
        type: [mongoose.Types.ObjectId],
        ref: "Complaint",
        default: []
    }

}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);