const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    main_category: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Category",
    },
    sub_categories: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Sub",
    }],

}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);