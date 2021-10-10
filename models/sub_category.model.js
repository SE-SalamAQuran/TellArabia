const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({ //Sub-categories schema
    parentCategory: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
    },
    name: {
        type: String,
        required: true,
        unique: true,
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
        ref: 'User',
    }
}, { timestamps: true });

module.exports = mongoose.model('Sub', subCategorySchema);