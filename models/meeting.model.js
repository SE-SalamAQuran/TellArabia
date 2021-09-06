const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    order: {
        type: mongoose.Types.ObjectId,
        ref: 'Order'
    },
    link: {
        type: String,
        required: true,
    }
})