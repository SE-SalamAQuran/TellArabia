const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
    order: {
        type: mongoose.Types.ObjectId,
        ref: 'Order',
    },
    date: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    complainant: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: "String",
        enum: ["Pending", "In Progress", "Resolved", "Closed"],
        default: "Pending"
    },
    accused: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);