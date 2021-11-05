const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lookupSchema = new Schema({
    classification: {
        type: String,
        unique: true,
        required: true,
    },
    values: {
        type: [String],
        default: []
    },

}, { timestamps: true });

module.exports = mongoose.model("Lookup", lookupSchema);