const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    main_category: {
        type: String,
        required: true,
    },
    sub_category: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ""
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);