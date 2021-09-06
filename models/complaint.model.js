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

}, { timestamps: true });

module.exports = mongoose.model("Meeting", meetingSchema);