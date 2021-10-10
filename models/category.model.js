const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({ //Main categories schema
    name: {
        type: String,
        required: true,
        unique: true,
    },
    url: {
        type: String,
        default: ""
    },
    addedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);